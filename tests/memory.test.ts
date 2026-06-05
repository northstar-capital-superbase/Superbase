import { describe, it, expect } from "vitest";
import { InMemoryStore } from "@/lib/memory/in-memory-store";

describe("InMemoryStore", () => {
  it("appends and reads back in chronological order", async () => {
    const store = new InMemoryStore();
    await store.append({ sessionId: "s1", kind: "message", author: "user", content: "first" });
    await store.append({ sessionId: "s1", kind: "plan", author: "orchestrator", content: "second" });
    const entries = await store.recent({ sessionId: "s1" });
    expect(entries.map((e) => e.content)).toEqual(["first", "second"]);
    expect(entries[0].id).toBeTruthy();
    expect(entries[0].createdAt).toBeTruthy();
  });

  it("isolates sessions", async () => {
    const store = new InMemoryStore();
    await store.append({ sessionId: "a", kind: "message", author: "user", content: "alpha" });
    await store.append({ sessionId: "b", kind: "message", author: "user", content: "beta" });
    expect(await store.recent({ sessionId: "a" })).toHaveLength(1);
    expect((await store.recent({ sessionId: "b" }))[0].content).toBe("beta");
  });

  it("filters by kind", async () => {
    const store = new InMemoryStore();
    await store.append({ sessionId: "s", kind: "message", author: "user", content: "m" });
    await store.append({ sessionId: "s", kind: "plan", author: "orchestrator", content: "p" });
    const plans = await store.recent({ sessionId: "s", kinds: ["plan"] });
    expect(plans).toHaveLength(1);
    expect(plans[0].kind).toBe("plan");
  });

  it("clears a session", async () => {
    const store = new InMemoryStore();
    await store.append({ sessionId: "s", kind: "message", author: "user", content: "x" });
    await store.clear("s");
    expect(await store.recent({ sessionId: "s" })).toHaveLength(0);
  });

  it("respects the limit (most recent)", async () => {
    const store = new InMemoryStore();
    for (let i = 0; i < 5; i++) {
      await store.append({ sessionId: "s", kind: "message", author: "user", content: `${i}` });
    }
    const last2 = await store.recent({ sessionId: "s", limit: 2 });
    expect(last2.map((e) => e.content)).toEqual(["3", "4"]);
  });
});
