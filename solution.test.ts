import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { readAllEvents } from "./solution.ts";

function sseResponse(payload: string): Response {
    return new Response(payload, {
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
