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

describe("callWithRetry with injected sleep + jitter", () => {
    it("calls the injected sleep function on retries", async (t: TestContext) => {
        const sleeps: number[] = [];
        const fakeSleep = async (ms: number) => { sleeps.push(ms); };
        let call = 0;
        t.mock.method(globalThis, "fetch", async () => {
            call++;
            if (call < 4) return new Response("unavailable", { status: 503 });
            return json({ result: "ok" });
        });
        await callWithRetry("https://api.example.test/x", undefined, { sleep: fakeSleep });
        assert.strictEqual(sleeps.length, 3, "3 sleeps for 3 retries");
    });

    it("applies ±25% jitter to each backoff interval", async (t: TestContext) => {
        const sleeps: number[] = [];
        const fakeSleep = async (ms: number) => { sleeps.push(ms); };
        let call = 0;
        t.mock.method(globalThis, "fetch", async () => {
            call++;
            if (call < 4) return new Response("unavailable", { status: 503 });
            return json({ result: "ok" });
        });
        await callWithRetry("https://api.example.test/x", undefined, { sleep: fakeSleep });
        // Expected base intervals 100, 200, 400; with ±25% jitter: [75-125, 150-250, 300-500].
        assert.ok(sleeps[0]! >= 75 && sleeps[0]! <= 125, `first sleep ${sleeps[0]} not in [75,125]`);
        assert.ok(sleeps[1]! >= 150 && sleeps[1]! <= 250, `second sleep ${sleeps[1]} not in [150,250]`);
        assert.ok(sleeps[2]! >= 300 && sleeps[2]! <= 500, `third sleep ${sleeps[2]} not in [300,500]`);
        // At least one should not be exactly the base (i.e. jitter did something)
        assert.ok(
            sleeps[0] !== 100 || sleeps[1] !== 200 || sleeps[2] !== 400,
            "jitter never changed any interval (implausible)",
        );
    });
});

describe("callWithRetry shouldRetry hook", () => {
    it("custom shouldRetry can force retry on 429", async (t: TestContext) => {
        const fakeSleep = async () => {};
        let call = 0;
        t.mock.method(globalThis, "fetch", async () => {
            call++;
            if (call < 3) return new Response("slow down", { status: 429 });
            return json({ result: "ok" });
        });
        const out = await callWithRetry<{ result: string }>(
            "https://api.example.test/x",
            undefined,
            { sleep: fakeSleep, shouldRetry: (res) => res.status === 429 || res.status >= 500 },
        );
        assert.deepStrictEqual(out, { result: "ok" });
        assert.strictEqual(call, 3);
    });

    it("custom shouldRetry can suppress retry on 503", async (t: TestContext) => {
        const fakeSleep = async () => {};
        let call = 0;
        t.mock.method(globalThis, "fetch", async () => {
            call++;
            return new Response("unavailable", { status: 503 });
        });
        await assert.rejects(
            () => callWithRetry(
                "https://api.example.test/x",
                undefined,
                { sleep: fakeSleep, shouldRetry: () => false },
            ),
        );
        assert.strictEqual(call, 1, "should not retry");
    });
});
