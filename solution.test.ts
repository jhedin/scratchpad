import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { whoAmI } from "./solution.ts";

describe("whoAmI", () => {
    it("returns the user object on 200", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
            const url = input instanceof URL ? input.href : typeof input === "string" ? input : input.url;
            assert.strictEqual(url, "https://example.test/me");
            const headers = new Headers(init?.headers);
            assert.strictEqual(headers.get("Authorization"), "Bearer sk_test_abc");
            return new Response(JSON.stringify({ id: "u_1", email: "a@b.c", plan: "pro" }), {
                status: 200,
            });
        });
        const me = await whoAmI("https://example.test", "sk_test_abc");
        assert.deepStrictEqual(me, { id: "u_1", email: "a@b.c", plan: "pro" });
    });

    it("throws with status + body on 403", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response("forbidden-body-text", { status: 403 }),
        );
        await assert.rejects(
            () => whoAmI("https://example.test", "sk_test_abc"),
            (err: Error) => err.message.includes("403") && err.message.includes("forbidden-body-text"),
        );
    });

    it("truncates long response bodies to 200 chars", async (t: TestContext) => {
        const longBody = "x".repeat(500);
        t.mock.method(globalThis, "fetch", async () => new Response(longBody, { status: 500 }));
        await assert.rejects(
            () => whoAmI("https://example.test", "sk_test_abc"),
            (err: Error) => err.message.length < 400, // status text + 200 body chars + some framing, well under 400
        );
    });
});
