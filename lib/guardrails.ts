// Lightweight, dependency-free guardrails for the run endpoints. Protects a
// deployed instance from runaway cost/abuse: every chat turn fires ~5 model
// calls, so we bound request rate and input size before doing any work.
//
// The limiter is in-process (per server instance) — matching the lab's
// local-first default. For multi-instance deploys, swap in a shared store
// (e.g. Supabase/Redis) behind the same interface.

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  retryAfterMs: number;
}

// Fixed-window limiter. Defaults: 20 requests / 60s, overridable via env.
export function rateLimit(
  key: string,
  opts?: { limit?: number; windowMs?: number },
): RateLimitResult {
  const limit = opts?.limit ?? Number(process.env.RATE_LIMIT_PER_MIN || 20);
  const windowMs = opts?.windowMs ?? 60_000;
  const now = Date.now();

  // Opportunistic prune so the map can't grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (now >= b.resetAt) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, limit, retryAfterMs: 0 };
  }

  bucket.count += 1;
  const allowed = bucket.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - bucket.count),
    limit,
    retryAfterMs: allowed ? 0 : bucket.resetAt - now,
  };
}

// Best-effort client identity from proxy headers, falling back to a shared key.
export function clientKey(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "global";
}

export const MAX_TASK_CHARS = Number(process.env.MAX_TASK_CHARS || 4000);

// Validate/normalize a user task. Returns the trimmed task or an error string.
export function validateTask(raw: unknown): { task: string } | { error: string } {
  const task = (raw ?? "").toString().trim();
  if (!task) return { error: "Missing task/message" };
  if (task.length > MAX_TASK_CHARS) {
    return { error: `Task too long (max ${MAX_TASK_CHARS} characters)` };
  }
  return { task };
}
