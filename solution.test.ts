import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { readAllEvents } from "./solution.ts";

function sseResponse(payload: string): Response {
    return new Response(payload, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
    });
}

function chunkedSseResponse(chunks: string[]): Response {
    // ReadableStream that delivers the provided chunks as separate read() results.
    let idx = 0;
    const stream = new ReadableStream<Uint8Array>({
        pull(controller) {
            if (idx < chunks.length) {
                controller.enqueue(new TextEncoder().encode(chunks[idx]!));
                idx++;
            } else {
                controller.close();
            }
        },
    });
    return new Response(stream, {
        status: 200,
        headers: { "Content-Type": "text/event-stream" },
    });
}

describe("readAllEvents", () => {
    it("collects data events until [DONE]", async (t: TestContext) => {
        const payload =
            `data: {"type":"ping","n":1}\n\n` +
            `data: {"type":"ping","n":2}\n\n` +
            `data: {"type":"done"}\n\n` +
            `data: [DONE]\n\n`;
        t.mock.method(globalThis, "fetch", async () => sseResponse(payload));
        const events = await readAllEvents("https://api.example.test");
        assert.deepStrictEqual(events, [
            { type: "ping", n: 1 },
            { type: "ping", n: 2 },
            { type: "done" },
        ]);
    });

    it("skips SSE comments (lines starting with ':')", async (t: TestContext) => {
        const payload =
            `: comment 1\n\n` +
            `data: {"n":1}\n\n` +
            `: keep-alive\n\n` +
            `data: {"n":2}\n\n` +
            `data: [DONE]\n\n`;
        t.mock.method(globalThis, "fetch", async () => sseResponse(payload));
        const events = await readAllEvents("https://api.example.test");
        assert.deepStrictEqual(events, [{ n: 1 }, { n: 2 }]);
    });

    it("handles a stream with no events (only [DONE])", async (t: TestContext) => {
        const payload = `data: [DONE]\n\n`;
        t.mock.method(globalThis, "fetch", async () => sseResponse(payload));
        const events = await readAllEvents("https://api.example.test");
        assert.deepStrictEqual(events, []);
    });
});

describe("readAllEvents with split chunks", () => {
    it("handles events split across chunk boundaries", async (t: TestContext) => {
        // The JSON `{"type":"ping","n":1}` is split mid-object across two chunks.
        t.mock.method(globalThis, "fetch", async () =>
            chunkedSseResponse([
                `data: {"type":"pi`,
                `ng","n":1}\n\ndata: {"type":"done"}\n\ndata: [DONE]\n\n`,
            ]),
        );
        const events = await readAllEvents("https://api.example.test");
        assert.deepStrictEqual(events, [{ type: "ping", n: 1 }, { type: "done" }]);
    });

    it("handles split in the 'data:' line prefix", async (t: TestContext) => {
        // The `data:` prefix itself is split — first chunk ends with "dat",
        // second starts with "a: {...}". Without buffering, the first chunk's
        // line "dat" is silently dropped (doesn't start with "data:"),
        // and the second chunk's line "a: {...}" is also dropped.
        t.mock.method(globalThis, "fetch", async () =>
            chunkedSseResponse([
                `dat`,
                `a: {"n":1}\n\ndata: {"n":2}\n\ndata: [DONE]\n\n`,
            ]),
        );
        const events = await readAllEvents("https://api.example.test");
        assert.deepStrictEqual(events, [{ n: 1 }, { n: 2 }]);
    });
});
