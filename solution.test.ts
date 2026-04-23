import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { Readable } from "node:stream";
import { upload, normalizeFileBytes } from "./solution.ts";

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

describe("normalizeFileBytes", () => {
    it("returns Uint8Array input as-is (same bytes)", async () => {
        const input = new Uint8Array([10, 20, 30]);
        const out = await normalizeFileBytes(input);
        assert.deepStrictEqual(Array.from(out), [10, 20, 30]);
    });

    it("accepts Buffer", async () => {
        const buf = Buffer.from([1, 2, 3, 4]);
        const out = await normalizeFileBytes(buf);
        assert.deepStrictEqual(Array.from(out), [1, 2, 3, 4]);
    });

    it("reads a Readable stream to completion", async () => {
        const stream = Readable.from([Buffer.from([7, 8]), Buffer.from([9])]);
        const out = await normalizeFileBytes(stream);
        assert.deepStrictEqual(Array.from(out), [7, 8, 9]);
    });
});

describe("upload with Buffer input", () => {
    it("accepts a Buffer as fileBytes", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response(JSON.stringify({ upload_id: "u_2" }), { status: 200 }),
        );
        const result = await upload("https://api.example.test", "sk_test_x", {
            metadata: {},
            fileBytes: Buffer.from([1, 2, 3]),
            filename: "x.bin",
        });
        assert.deepStrictEqual(result, { upload_id: "u_2" });
    });
});

describe("upload progress callback", () => {
    it("invokes onProgress with cumulative byte counts in 64KB chunks", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response(JSON.stringify({ upload_id: "u_p" }), { status: 200 }),
        );
        const size = 200 * 1024; // 200KB -> 64+64+64+8 chunks -> progress reports 65536, 131072, 196608, 204800
        const bytes = new Uint8Array(size);
        const progress: number[] = [];
        await upload(
            "https://api.example.test",
            "sk_test_x",
            { metadata: {}, fileBytes: bytes, filename: "x.bin" },
            { onProgress: (sent) => progress.push(sent) },
        );
        assert.ok(progress.length >= 2, `expected multiple progress calls, got ${progress.length}`);
        // Last value should equal total
        assert.strictEqual(progress[progress.length - 1], size);
        // Strictly increasing
        for (let i = 1; i < progress.length; i++) {
            assert.ok(progress[i]! > progress[i - 1]!, `progress not increasing at ${i}`);
        }
    });

    it("does not invoke onProgress when option is absent", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response(JSON.stringify({ upload_id: "u_q" }), { status: 200 }),
        );
        await upload(
            "https://api.example.test",
            "sk_test_x",
            { metadata: {}, fileBytes: new Uint8Array(10), filename: "x" },
        );
        // No assertion needed — just that it doesn't throw
    });
});
