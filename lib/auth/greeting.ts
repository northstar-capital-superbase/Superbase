// Pure, isomorphic greeting helpers — no Supabase/Next imports, so they run
// identically on the client (AuthProvider/Dashboard) and server. Northstar
// never fabricates or hardcodes a user's name: display_name → a safe
// fallback derived from their own email → a generic greeting.
export function greetingName(
  displayName: string | null | undefined,
  email: string | null | undefined,
): string | null {
  const name = displayName?.trim();
  if (name) return name;
  const local = email?.split("@")[0]?.trim();
  return local || null;
}

export function timeOfDay(date: Date = new Date()): "morning" | "afternoon" | "evening" {
  const h = date.getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export function greetingText(
  displayName: string | null | undefined,
  email: string | null | undefined,
  date: Date = new Date(),
): string {
  const base =
    timeOfDay(date) === "morning"
      ? "Good morning"
      : timeOfDay(date) === "afternoon"
        ? "Good afternoon"
        : "Good evening";
  const name = greetingName(displayName, email);
  return name ? `${base}, ${name}.` : `${base}.`;
}
