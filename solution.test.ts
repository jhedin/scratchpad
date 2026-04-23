import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { callWithRetry } from "./solution.ts";

function json(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status });
}

describe("callWithRetry on 429", () => {
    it("honors Retry-After (seconds) and succeeds after waiting", async (t: TestContext) => {
        const sleeps: number[] = [];
        const fakeSleep = async (ms: number) => { sleeps.push(ms); };
        let call = 0;
        t.mock.method(globalThis, "fetch", async () => {
            call++;
            if (call === 1) {
                return new Response("slow", { status: 429, headers: { "Retry-After": "2" } });
            }
            return json({ result: "ok" });
        });
        const out = await callWithRetry<{ result: string }>("https://api.example.test/x", undefined, {
            sleep: fakeSleep,
        });
        assert.deepStrictEqual(out, { result: "ok" });
        assert.deepStrictEqual(sleeps, [2000], "should sleep 2000ms (2 seconds)");
    });

    it("falls back to backoff on 429 WITHOUT Retry-After", async (t: TestContext) => {
        const sleeps: number[] = [];
        const fakeSleep = async (ms: number) => { sleeps.push(ms); };
        let call = 0;
        t.mock.method(globalThis, "fetch", async () => {
            call++;
            if (call === 1) return new Response("slow", { status: 429 });
            return json({ result: "ok" });
        });
        const out = await callWithRetry<{ result: string }>("https://api.example.test/x", undefined, {
            sleep: fakeSleep,
        });
        assert.deepStrictEqual(out, { result: "ok" });
        assert.strictEqual(sleeps.length, 1);
        assert.ok(sleeps[0]! >= 75 && sleeps[0]! <= 125, `first sleep should be ~100ms ±25%, got ${sleeps[0]}`);
    });

    it("retries on 5xx with exponential backoff", async (t: TestContext) => {
        const fakeSleep = async () => {};
        let call = 0;
        t.mock.method(globalThis, "fetch", async () => {
            call++;
            if (call < 4) return new Response("oops", { status: 503 });
            return json({ result: "ok" });
        });
        const out = await callWithRetry<{ result: string }>("https://api.example.test/x", undefined, {
            sleep: fakeSleep,
        });
        assert.deepStrictEqual(out, { result: "ok" });
        assert.strictEqual(call, 4);
    });

    it("throws immediately on 4xx (non-429)", async (t: TestContext) => {
        let call = 0;
        t.mock.method(globalThis, "fetch", async () => {
            call++;
            return new Response("bad", { status: 400 });
        });
        await assert.rejects(() => callWithRetry("https://api.example.test/x"));
        assert.strictEqual(call, 1);
    });
});
