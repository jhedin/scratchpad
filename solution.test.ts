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

describe("callWithRetry with HTTP-date Retry-After", () => {
    it("parses Retry-After as an HTTP-date and sleeps until that time", async (t: TestContext) => {
        const sleeps: number[] = [];
        const fakeSleep = async (ms: number) => { sleeps.push(ms); };
        // Fix "now" so the test is deterministic
        const baseTime = 1700000000000; // 2023-11-14T22:13:20Z
        const originalNow = Date.now;
        Date.now = () => baseTime;
        try {
            const futureDate = new Date(baseTime + 5000).toUTCString(); // 5 seconds in the future
            let call = 0;
            t.mock.method(globalThis, "fetch", async () => {
                call++;
                if (call === 1) {
                    return new Response("slow", { status: 429, headers: { "Retry-After": futureDate } });
                }
                return json({ result: "ok" });
            });
            const out = await callWithRetry<{ result: string }>("https://api.example.test/x", undefined, {
                sleep: fakeSleep,
            });
            assert.deepStrictEqual(out, { result: "ok" });
            assert.strictEqual(sleeps.length, 1);
            // Allow small tolerance for parsing precision
            assert.ok(sleeps[0]! >= 4000 && sleeps[0]! <= 6000, `expected ~5000ms, got ${sleeps[0]}`);
        } finally {
            Date.now = originalNow;
        }
    });

    it("falls back to backoff when Retry-After is not parseable as number or date", async (t: TestContext) => {
        const sleeps: number[] = [];
        const fakeSleep = async (ms: number) => { sleeps.push(ms); };
        let call = 0;
        t.mock.method(globalThis, "fetch", async () => {
            call++;
            if (call === 1) return new Response("slow", { status: 429, headers: { "Retry-After": "banana" } });
            return json({ result: "ok" });
        });
        await callWithRetry("https://api.example.test/x", undefined, { sleep: fakeSleep });
        assert.ok(sleeps[0]! >= 75 && sleeps[0]! <= 125, `expected ~100ms backoff, got ${sleeps[0]}`);
    });
});
