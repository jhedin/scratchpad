import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { isHealthy } from "./solution.ts";

describe("isHealthy", () => {
    it("returns true when the endpoint responds with ok:true", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response(JSON.stringify({ ok: true, version: "1.0.0" }), { status: 200 }),
        );
        assert.strictEqual(await isHealthy("https://example.test"), true);
    });

    it("returns false when fetch throws", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () => {
            throw new Error("network");
        });
        assert.strictEqual(await isHealthy("https://example.test"), false);
    });

    it("returns false when the server returns 500", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response("oops", { status: 500 }),
        );
        assert.strictEqual(await isHealthy("https://example.test"), false);
    });

    it("treats legacy {ok: \"true\"} string form as unhealthy", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response(JSON.stringify({ ok: "true", version: "0.9.0" }), { status: 200 }),
        );
        assert.strictEqual(await isHealthy("https://example.test"), false);
    });
});
