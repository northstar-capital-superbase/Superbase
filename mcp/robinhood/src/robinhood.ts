// Minimal, read-only Robinhood client.
//
// Robinhood has no official public API; this talks to the same unofficial
// HTTP endpoints the web/mobile clients use. It is intentionally limited to
// READ operations (quotes, fundamentals, account, portfolio, positions,
// watchlists) — there is no order-placement surface here by design. See the
// package README for the auth model and the terms-of-service caveat.

const BASE = "https://api.robinhood.com";

// Well-known public OAuth client id used by Robinhood's own web client. This is
// not a secret — it ships in their front-end bundle — but it is required for
// the password grant.
const CLIENT_ID = "c82SH0WZOsabOXGP2sxqcj34FxkvfnWRZBKlBjFS";

export interface RobinhoodAuth {
  accessToken: string;
  // Present only after a fresh password login; undefined when a token is
  // supplied directly via the environment.
  refreshToken?: string;
  expiresAt?: number; // epoch ms
}

export interface LoginParams {
  username: string;
  password: string;
  /** TOTP / SMS code when MFA is enabled on the account. */
  mfaCode?: string;
  /** Stable per-device UUID. Reusing one reduces device-approval challenges. */
  deviceToken?: string;
}

export class RobinhoodError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "RobinhoodError";
  }
}

export class RobinhoodClient {
  private auth: RobinhoodAuth | null = null;

  constructor(token?: string) {
    if (token) this.auth = { accessToken: token };
  }

  get isAuthenticated(): boolean {
    return Boolean(this.auth?.accessToken);
  }

  /**
   * Password-grant login. Returns the auth on success. If Robinhood responds
   * with an MFA challenge, a `RobinhoodError` is thrown asking the caller to
   * retry with `mfaCode` — the read-only flow keeps this deliberately simple.
   */
  async login(params: LoginParams): Promise<RobinhoodAuth> {
    const deviceToken = params.deviceToken ?? randomDeviceToken();
    const payload: Record<string, unknown> = {
      grant_type: "password",
      client_id: CLIENT_ID,
      scope: "internal",
      username: params.username,
      password: params.password,
      device_token: deviceToken,
      expires_in: 86400,
    };
    if (params.mfaCode) payload.mfa_code = params.mfaCode;

    const res = await fetch(`${BASE}/oauth2/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

    if (data.mfa_required) {
      throw new RobinhoodError(
        "MFA required — call authenticate again with the current 'mfaCode' (and reuse the same deviceToken).",
        res.status,
        data,
      );
    }
    if (!res.ok || !data.access_token) {
      throw new RobinhoodError(
        `Login failed: ${data.error_description ?? data.detail ?? res.statusText}`,
        res.status,
        data,
      );
    }

    this.auth = {
      accessToken: String(data.access_token),
      refreshToken: data.refresh_token ? String(data.refresh_token) : undefined,
      expiresAt: typeof data.expires_in === "number" ? Date.now() + data.expires_in * 1000 : undefined,
    };
    return this.auth;
  }

  // ── Read endpoints ────────────────────────────────────────────────────────

  /** Live quotes for one or more symbols. */
  quotes(symbols: string[]): Promise<RhPaginated<RhQuote>> {
    return this.get(`/quotes/?symbols=${encodeURIComponent(symbols.join(",").toUpperCase())}`);
  }

  /** Historical OHLC for one or more symbols. */
  historicals(
    symbols: string[],
    interval: "5minute" | "10minute" | "hour" | "day" | "week" = "day",
    span: "day" | "week" | "month" | "3month" | "year" | "5year" = "year",
  ): Promise<RhPaginated<RhHistorical>> {
    const q = new URLSearchParams({
      symbols: symbols.join(",").toUpperCase(),
      interval,
      span,
    });
    return this.get(`/quotes/historicals/?${q.toString()}`);
  }

  /** Company fundamentals (market cap, P/E, sector, description, …). */
  fundamentals(symbol: string): Promise<RhFundamentals> {
    return this.get(`/fundamentals/${encodeURIComponent(symbol.toUpperCase())}/`);
  }

  /** Brokerage accounts (buying power, cash, account number). */
  accounts(): Promise<RhPaginated<RhAccount>> {
    return this.get(`/accounts/`);
  }

  /** Portfolio snapshots (equity, market value, previous close). */
  portfolios(): Promise<RhPaginated<RhPortfolio>> {
    return this.get(`/portfolios/`);
  }

  /** Open positions. `nonzero` filters out fully-closed lots. */
  positions(nonzero = true): Promise<RhPaginated<RhPosition>> {
    return this.get(`/positions/${nonzero ? "?nonzero=true" : ""}`);
  }

  /** Resolve a position/instrument URL (or id) into its instrument record. */
  instrument(urlOrId: string): Promise<RhInstrument> {
    if (urlOrId.startsWith("http")) return this.getAbsolute(urlOrId);
    return this.get(`/instruments/${encodeURIComponent(urlOrId)}/`);
  }

  /** Search instruments by free-text query (symbol or company name). */
  searchInstruments(query: string): Promise<RhPaginated<RhInstrument>> {
    return this.get(`/instruments/?query=${encodeURIComponent(query)}`);
  }

  // ── Internals ──────────────────────────────────────────────────────────────

  private get<T>(path: string): Promise<T> {
    return this.getAbsolute<T>(`${BASE}${path}`);
  }

  private async getAbsolute<T>(url: string): Promise<T> {
    if (!this.auth?.accessToken) {
      throw new RobinhoodError("Not authenticated. Set ROBINHOOD_TOKEN or call the authenticate tool first.");
    }
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.auth.accessToken}`,
        Accept: "application/json",
      },
    });
    if (res.status === 401) {
      throw new RobinhoodError("Unauthorized — token expired or invalid. Re-authenticate.", 401);
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new RobinhoodError(`Request failed (${res.status}) for ${url}`, res.status, body);
    }
    return (await res.json()) as T;
  }
}

function randomDeviceToken(): string {
  // RFC4122-ish v4 token; Robinhood only needs a stable random UUID per device.
  const g = globalThis as { crypto?: { randomUUID?: () => string } };
  if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Response shapes (only the fields we surface) ──────────────────────────────

export interface RhPaginated<T> {
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface RhQuote {
  symbol: string;
  last_trade_price: string;
  previous_close: string;
  ask_price: string;
  bid_price: string;
  updated_at: string;
  trading_halted: boolean;
}

export interface RhHistorical {
  symbol: string;
  interval: string;
  span: string;
  historicals: Array<{
    begins_at: string;
    open_price: string;
    close_price: string;
    high_price: string;
    low_price: string;
    volume: number;
  }>;
}

export interface RhFundamentals {
  description?: string;
  sector?: string;
  industry?: string;
  market_cap?: string;
  pe_ratio?: string;
  dividend_yield?: string;
  high_52_weeks?: string;
  low_52_weeks?: string;
  [k: string]: unknown;
}

export interface RhAccount {
  account_number: string;
  buying_power: string;
  cash: string;
  type: string;
}

export interface RhPortfolio {
  equity: string;
  market_value: string;
  extended_hours_equity: string | null;
  adjusted_equity_previous_close: string;
}

export interface RhPosition {
  instrument: string;
  quantity: string;
  average_buy_price: string;
  updated_at: string;
}

export interface RhInstrument {
  id: string;
  symbol: string;
  name: string;
  simple_name: string | null;
  tradeable: boolean;
}
