import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { createCharge } from "./solution.ts";

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
