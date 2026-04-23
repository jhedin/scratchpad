import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import axios, { type AxiosResponse, type AxiosError } from "axios";
import { callWithRetry } from "./solution.ts";

function ok<T>(data: T): AxiosResponse<T> {
    return { data, status: 200, statusText: "OK", headers: {}, config: {} as any } as AxiosResponse<T>;
}

function axiosErr(status: number): AxiosError {
    const err = new Error(`Request failed with status code ${status}`) as AxiosError;
    err.isAxiosError = true;
    err.response = {
        data: { msg: "failure" },
        status,
        statusText: "",
        headers: {},
        config: {} as any,
    } as AxiosResponse;
    return err;
}

describe("callWithRetry (axios)", () => {
    it("returns data on 2xx", async (t: TestContext) => {
        t.mock.method(axios, "get", async () => ok({ result: 42 }));
        const out = await callWithRetry<{ result: number }>("https://api.example.test/x");
        assert.deepStrictEqual(out, { result: 42 });
    });

    it("retries on 503 and eventually succeeds", async (t: TestContext) => {
        let call = 0;
        t.mock.method(axios, "get", async () => {
            call++;
            if (call < 4) throw axiosErr(503);
            return ok({ result: "ok" });
        });
        const out = await callWithRetry<{ result: string }>("https://api.example.test/x");
        assert.deepStrictEqual(out, { result: "ok" });
        assert.strictEqual(call, 4);
    });

    it("throws on 4xx without retry", async (t: TestContext) => {
        let call = 0;
        t.mock.method(axios, "get", async () => {
            call++;
            throw axiosErr(400);
        });
        await assert.rejects(() => callWithRetry("https://api.example.test/x"));
        assert.strictEqual(call, 1);
    });

    it("gives up after 3 retries on persistent 5xx", async (t: TestContext) => {
        let call = 0;
        t.mock.method(axios, "get", async () => {
            call++;
            throw axiosErr(502);
        });
        await assert.rejects(() => callWithRetry("https://api.example.test/x"));
        assert.strictEqual(call, 4);
    });
});

describe("callWithRetry with jitter + injected sleep", () => {
    it("applies ±25% jitter to each backoff interval", async (t: TestContext) => {
        const sleeps: number[] = [];
        const fakeSleep = async (ms: number) => { sleeps.push(ms); };
        let call = 0;
        t.mock.method(axios, "get", async () => {
            call++;
            if (call < 4) throw axiosErr(503);
            return ok({ r: 1 });
        });
        await callWithRetry("https://api.example.test/x", undefined, { sleep: fakeSleep });
        assert.ok(sleeps[0]! >= 75 && sleeps[0]! <= 125);
        assert.ok(sleeps[1]! >= 150 && sleeps[1]! <= 250);
        assert.ok(sleeps[2]! >= 300 && sleeps[2]! <= 500);
        assert.ok(
            sleeps[0] !== 100 || sleeps[1] !== 200 || sleeps[2] !== 400,
            "jitter never changed any interval (implausible)",
        );
    });
});

describe("callWithRetry shouldRetry hook (axios)", () => {
    it("custom shouldRetry can force retry on 429", async (t: TestContext) => {
        const fakeSleep = async () => {};
        let call = 0;
        t.mock.method(axios, "get", async () => {
            call++;
            if (call < 3) throw axiosErr(429);
            return ok({ r: 1 });
        });
        const out = await callWithRetry(
            "https://api.example.test/x",
            undefined,
            { sleep: fakeSleep, shouldRetry: (err) => (err.response?.status ?? 0) === 429 || (err.response?.status ?? 0) >= 500 },
        );
        assert.deepStrictEqual(out, { r: 1 });
        assert.strictEqual(call, 3);
    });

    it("custom shouldRetry can suppress retry on 503", async (t: TestContext) => {
        const fakeSleep = async () => {};
        let call = 0;
        t.mock.method(axios, "get", async () => {
            call++;
            throw axiosErr(503);
        });
        await assert.rejects(() => callWithRetry("https://api.example.test/x", undefined, {
            sleep: fakeSleep, shouldRetry: () => false,
        }));
        assert.strictEqual(call, 1);
    });
});
