import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { createRefund } from "./src/services/refund-service.ts";

describe("createRefund", () => {
    it("POSTs to /refunds with the right body and returns the parsed refund", async (t: TestContext) => {
        let captured: { url: string; method: string; body: unknown; headers: Headers } | null = null;
        t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
            captured = {
                url: input instanceof URL ? input.href : String(input),
                method: init?.method ?? "GET",
                body: init?.body,
                headers: new Headers(init?.headers),
            };
            return new Response(
                JSON.stringify({ id: "re_1", charge_id: "ch_1", amount: 500, status: "succeeded" }),
                { status: 200 },
            );
        });
        const refund = await createRefund({ charge_id: "ch_1", amount: 500 });
        assert.deepStrictEqual(refund, {
            id: "re_1",
            charge_id: "ch_1",
            amount: 500,
            status: "succeeded",
        });
        assert.ok(captured);
        assert.strictEqual(captured!.method, "POST");
        assert.match(captured!.url, /\/refunds$/);
        assert.strictEqual(captured!.headers.get("Content-Type"), "application/json");
        const sent = JSON.parse(captured!.body as string);
        assert.deepStrictEqual(sent, { charge_id: "ch_1", amount: 500 });
    });

    it("propagates ApiError on non-2xx", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response("charge not found", { status: 404 }),
        );
        await assert.rejects(() => createRefund({ charge_id: "bad", amount: 100 }));
    });
});
