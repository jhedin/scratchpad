import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { isHealthy, getVersion } from "./solution.ts";

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

describe("getVersion", () => {
    it("returns the version string on success", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response(JSON.stringify({ ok: true, version: "2.1.0" }), { status: 200 }),
        );
        assert.strictEqual(await getVersion("https://example.test"), "2.1.0");
    });

    it("returns null when fetch throws", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () => {
            throw new Error("network");
        });
        assert.strictEqual(await getVersion("https://example.test"), null);
    });

    it("returns null on non-2xx", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response("err", { status: 503 }),
        );
        assert.strictEqual(await getVersion("https://example.test"), null);
    });
});
