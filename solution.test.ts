import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { whoAmI, AuthError } from "./solution.ts";

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

describe("whoAmI with config-object token", () => {
    it("accepts { apiKey } shape and sends the same bearer header", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async (_input: RequestInfo | URL, init?: RequestInit) => {
            const headers = new Headers(init?.headers);
            assert.strictEqual(headers.get("Authorization"), "Bearer sk_test_xyz");
            return new Response(JSON.stringify({ id: "u_2", email: "x@y.z", plan: "free" }), { status: 200 });
        });
        const me = await whoAmI("https://example.test", { apiKey: "sk_test_xyz" });
        assert.deepStrictEqual(me, { id: "u_2", email: "x@y.z", plan: "free" });
    });
});

describe("whoAmI AuthError on 401", () => {
    it("throws AuthError with the X-Request-Id from the response", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response("nope", {
                status: 401,
                headers: { "X-Request-Id": "req_abc123" },
            }),
        );
        await assert.rejects(
            () => whoAmI("https://example.test", "sk_test_abc"),
            (err: Error) => {
                assert.ok(err instanceof AuthError, `expected AuthError, got ${err.constructor.name}`);
                assert.strictEqual((err as AuthError).requestId, "req_abc123");
                return true;
            },
        );
    });

    it("AuthError.requestId is null when no X-Request-Id header present", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () => new Response("nope", { status: 401 }));
        await assert.rejects(
            () => whoAmI("https://example.test", "sk_test_abc"),
            (err: Error) => {
                assert.ok(err instanceof AuthError);
                assert.strictEqual((err as AuthError).requestId, null);
                return true;
            },
        );
    });

    it("still throws plain Error (not AuthError) on 500", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () => new Response("boom", { status: 500 }));
        await assert.rejects(
            () => whoAmI("https://example.test", "sk_test_abc"),
            (err: Error) => !(err instanceof AuthError) && err.message.includes("500"),
        );
    });
});
