import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { createCharge, ApiError } from "./solution.ts";

describe("createCharge", () => {
    it("POSTs JSON and returns the charge on 200", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
            assert.strictEqual(init?.method, "POST");
            const headers = new Headers(init?.headers);
            assert.strictEqual(headers.get("Content-Type"), "application/json");
            assert.strictEqual(headers.get("Authorization"), "Bearer sk_test_x");
            const bodyParsed = JSON.parse(init?.body as string);
            assert.deepStrictEqual(bodyParsed, { amount: 1000, currency: "usd", source: "tok_visa" });
            return new Response(JSON.stringify({ id: "ch_1", amount: 1000 }), { status: 200 });
        });
        const ch = await createCharge("https://api.example.test", "sk_test_x", {
            amount: 1000,
            currency: "usd",
            source: "tok_visa",
        });
        assert.deepStrictEqual(ch, { id: "ch_1", amount: 1000 });
    });

    it("throws with type/code: message from the wrapped error envelope", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response(
                JSON.stringify({
                    error: { type: "card_error", code: "card_declined", message: "Your card was declined" },
                }),
                { status: 402 },
            ),
        );
        await assert.rejects(
            () => createCharge("https://api.example.test", "sk_test_x", { amount: 1, currency: "usd", source: "tok_x" }),
            (err: Error) => err.message === "card_error/card_declined: Your card was declined",
        );
    });

    it("handles the flat error envelope (no outer 'error' wrapper)", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response(
                JSON.stringify({
                    type: "card_error",
                    code: "insufficient_funds",
                    message: "insufficient funds",
                }),
                { status: 402 },
            ),
        );
        await assert.rejects(
            () => createCharge("https://api.example.test", "sk_test_x", { amount: 1, currency: "usd", source: "tok_x" }),
            (err: Error) => err.message === "card_error/insufficient_funds: insufficient funds",
        );
    });
});

describe("createCharge throws ApiError", () => {
    it("throws ApiError with status and param set", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response(
                JSON.stringify({
                    error: {
                        type: "validation_error",
                        code: "missing_param",
                        message: "Missing required param: source",
                        param: "source",
                    },
                }),
                { status: 400 },
            ),
        );
        await assert.rejects(
            () => createCharge("https://api.example.test", "sk_test_x", { amount: 1, currency: "usd", source: "tok_x" }),
            (err: Error) => {
                assert.ok(err instanceof ApiError, `expected ApiError, got ${err.constructor.name}`);
                const api = err as ApiError;
                assert.strictEqual(api.type, "validation_error");
                assert.strictEqual(api.code, "missing_param");
                assert.strictEqual(api.param, "source");
                assert.strictEqual(api.status, 400);
                return true;
            },
        );
    });
});

describe("ApiError.retryable classification", () => {
    it("api_error type is retryable", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response(
                JSON.stringify({ error: { type: "api_error", code: "server_busy", message: "try again" } }),
                { status: 503 },
            ),
        );
        await assert.rejects(
            () => createCharge("https://api.example.test", "sk_test_x", { amount: 1, currency: "usd", source: "tok_x" }),
            (err: Error) => (err as ApiError).retryable === true,
        );
    });

    it("card_error type is NOT retryable", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response(
                JSON.stringify({ error: { type: "card_error", code: "card_declined", message: "declined" } }),
                { status: 402 },
            ),
        );
        await assert.rejects(
            () => createCharge("https://api.example.test", "sk_test_x", { amount: 1, currency: "usd", source: "tok_x" }),
            (err: Error) => (err as ApiError).retryable === false,
        );
    });

    it("unknown type defaults to not retryable", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response(JSON.stringify({ error: { type: "weird_type", code: "?", message: "?" } }), {
                status: 400,
            }),
        );
        await assert.rejects(
            () => createCharge("https://api.example.test", "sk_test_x", { amount: 1, currency: "usd", source: "tok_x" }),
            (err: Error) => (err as ApiError).retryable === false,
        );
    });
});
