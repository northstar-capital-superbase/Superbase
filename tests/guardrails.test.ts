import { describe, it, expect } from "vitest";
import { rateLimit, validateTask, MAX_TASK_CHARS } from "@/lib/guardrails";

describe("rateLimit", () => {
  it("allows up to the limit, then blocks within the window", () => {
    const key = `t-${Math.random()}`;
    const opts = { limit: 3, windowMs: 60_000 };
    expect(rateLimit(key, opts).allowed).toBe(true);
    expect(rateLimit(key, opts).allowed).toBe(true);
    expect(rateLimit(key, opts).allowed).toBe(true);
    const blocked = rateLimit(key, opts);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    const key = `t-${Math.random()}`;
    const opts = { limit: 1, windowMs: 0 }; // window already elapsed on next call
    expect(rateLimit(key, opts).allowed).toBe(true);
    expect(rateLimit(key, opts).allowed).toBe(true);
  });

  it("keys are independent", () => {
    const opts = { limit: 1, windowMs: 60_000 };
    expect(rateLimit(`a-${Math.random()}`, opts).allowed).toBe(true);
    expect(rateLimit(`b-${Math.random()}`, opts).allowed).toBe(true);
  });
});

describe("validateTask", () => {
  it("rejects empty / whitespace", () => {
    expect(validateTask("")).toHaveProperty("error");
    expect(validateTask("   ")).toHaveProperty("error");
    expect(validateTask(null)).toHaveProperty("error");
  });

  it("rejects oversized input", () => {
    const res = validateTask("x".repeat(MAX_TASK_CHARS + 1));
    expect(res).toHaveProperty("error");
  });

  it("trims and returns valid tasks", () => {
    const res = validateTask("  hello  ");
    expect(res).toEqual({ task: "hello" });
  });
});
