import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { chargeOnce } from "./solution.ts";

describe("chargeOnce", () => {
    it("POSTs to /charges with Idempotency-Key and JSON body", async (t: TestContext) => {
        let captured: { headers: Headers; body: string; method: string } | null = null;
        t.mock.method(globalThis, "fetch", async (_input: RequestInfo | URL, init?: RequestInit) => {
            captured = {
                headers: new Headers(init?.headers),
                body: init?.body as string,
                method: init?.method ?? "GET",
            };
            return new Response(JSON.stringify({ id: "ch_1", amount: 1000 }), { status: 200 });
        });
        const ch = await chargeOnce("https://api.example.test", "sk_test_x", {
            amount: 1000,
            currency: "usd",
            source: "tok_visa",
        });
        assert.deepStrictEqual(ch, { id: "ch_1", amount: 1000 });
        assert.ok(captured, "fetch was called");
        assert.strictEqual(captured!.method, "POST");
        assert.strictEqual(captured!.headers.get("Content-Type"), "application/json");
        assert.strictEqual(captured!.headers.get("Authorization"), "Bearer sk_test_x");
        const key = captured!.headers.get("Idempotency-Key");
        assert.ok(key, "Idempotency-Key header present");
        // UUID v4 sanity check
        assert.match(key!, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        assert.deepStrictEqual(JSON.parse(captured!.body), {
            amount: 1000,
            currency: "usd",
            source: "tok_visa",
        });
    });

    it("throws on non-2xx", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () => new Response("bad", { status: 400 }));
        await assert.rejects(
            () => chargeOnce("https://api.example.test", "sk_test_x", {
                amount: 1, currency: "usd", source: "tok_x",
            }),
        );
    });
});

describe("chargeOnce retry + idempotency", () => {
    it("reuses the same idempotency key across retries", async (t: TestContext) => {
        const keys: string[] = [];
        let call = 0;
        const fakeSleep = async () => {};
        t.mock.method(globalThis, "fetch", async (_input: RequestInfo | URL, init?: RequestInit) => {
            call++;
            const hdr = new Headers(init?.headers).get("Idempotency-Key");
            if (hdr) keys.push(hdr);
            if (call < 3) return new Response("server busy", { status: 503 });
            return new Response(JSON.stringify({ id: "ch_1", amount: 100 }), { status: 200 });
        });
        const ch = await chargeOnce(
            "https://api.example.test", "sk_test_x",
            { amount: 100, currency: "usd", source: "tok_x" },
            { sleep: fakeSleep },
        );
        assert.deepStrictEqual(ch, { id: "ch_1", amount: 100 });
        assert.strictEqual(keys.length, 3, "3 attempts sent 3 keys");
        assert.strictEqual(keys[0], keys[1], "keys must match across retries");
        assert.strictEqual(keys[1], keys[2], "keys must match across retries");
    });
});
