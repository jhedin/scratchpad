import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.rejects(() => fn())   — expects a promise rejection
import { solution } from "./solution.ts";

describe("solution", () => {
    it("returns ok:true when the status endpoint reports healthy", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response(JSON.stringify({ ok: true }), { status: 200 }),
        );
        const result = await solution({ baseUrl: "https://example.test" });
        assert.deepStrictEqual(result, { ok: true });
    });

    it("returns ok:false when fetch throws", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () => {
            throw new Error("network");
        });
        const result = await solution({ baseUrl: "https://example.test" });
        assert.deepStrictEqual(result, { ok: false });
    });
});
