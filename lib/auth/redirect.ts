const FALLBACK_PATH = "/labs";

// Accept only an application-local absolute path. URLSearchParams has already
// decoded the value by the time this runs, so protocol-relative URLs,
// backslash-normalized URLs, and absolute schemes are rejected before they
// ever reach router.replace().
export function safeRedirectPath(
  candidate: string | null | undefined,
  fallback = FALLBACK_PATH,
): string {
  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(candidate)
  ) {
    return fallback;
  }

  try {
    const base = "https://northstar.invalid";
    const parsed = new URL(candidate, base);
    if (parsed.origin !== base) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
