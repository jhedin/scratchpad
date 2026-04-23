import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { callWithRetry } from "./solution.ts";

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status });
}

describe("callWithRetry", () => {
    it("returns parsed JSON on 2xx", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () => json({ result: 42 }));
        const out = await callWithRetry<{ result: number }>("https://api.example.test/x");
        assert.deepStrictEqual(out, { result: 42 });
    });

    it("retries on 503 up to 3 times, succeeds on 4th attempt", async (t: TestContext) => {
        let call = 0;
        t.mock.method(globalThis, "fetch", async () => {
            call++;
            if (call < 4) return new Response("unavailable", { status: 503 });
            return json({ result: "ok" });
        });
        const out = await callWithRetry<{ result: string }>("https://api.example.test/x");
        assert.deepStrictEqual(out, { result: "ok" });
        assert.strictEqual(call, 4);
    });

    it("throws on 4xx without retrying", async (t: TestContext) => {
        let call = 0;
        t.mock.method(globalThis, "fetch", async () => {
            call++;
            return new Response("bad", { status: 400 });
        });
        await assert.rejects(() => callWithRetry("https://api.example.test/x"));
        assert.strictEqual(call, 1);
    });

    it("gives up after 3 retries", async (t: TestContext) => {
        let call = 0;
        t.mock.method(globalThis, "fetch", async () => {
            call++;
            return new Response("gone", { status: 502 });
        });
        await assert.rejects(() => callWithRetry("https://api.example.test/x"));
        assert.strictEqual(call, 4);
    });
});
