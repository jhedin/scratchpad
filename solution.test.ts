import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { upload } from "./solution.ts";

describe("upload", () => {
    it("POSTs multipart with metadata JSON and file blob", async (t: TestContext) => {
        let captured: { headers: Headers; body: unknown; method: string; url: string } | null = null;
        t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
            captured = {
                headers: new Headers(init?.headers),
                body: init?.body,
                method: init?.method ?? "GET",
                url: input instanceof URL ? input.href : String(input),
            };
            return new Response(JSON.stringify({ upload_id: "u_1" }), { status: 200 });
        });
        const fileBytes = new Uint8Array([1, 2, 3, 4, 5]);
        const result = await upload("https://api.example.test", "sk_test_x", {
            metadata: { name: "logo.png" },
            fileBytes,
            filename: "logo.png",
        });
        assert.deepStrictEqual(result, { upload_id: "u_1" });
        assert.ok(captured);
        assert.strictEqual(captured!.method, "POST");
        assert.strictEqual(captured!.url, "https://api.example.test/upload");
        assert.strictEqual(captured!.headers.get("Authorization"), "Bearer sk_test_x");
        // Content-Type should NOT be manually set — fetch sets it from FormData with a boundary
        assert.strictEqual(captured!.headers.get("Content-Type"), null);
        assert.ok(captured!.body instanceof FormData, `body should be FormData, got ${typeof captured!.body}`);
    });

    it("throws on non-2xx", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () => new Response("bad", { status: 400 }));
        const fileBytes = new Uint8Array([1]);
        await assert.rejects(
            () =>
                upload("https://api.example.test", "sk_test_x", {
                    metadata: {}, fileBytes, filename: "x.bin",
                }),
        );
    });
});
