import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { listEvents } from "./solution.ts";

function eventsResponse(ids: string[], hasMore: boolean, lastId?: string): Response {
    const body: Record<string, unknown> = {
        data: ids.map((id) => ({ id, type: "test", created_at: "2026-01-01" })),
        has_more: hasMore,
    };
    if (lastId !== undefined) body.last_id = lastId;
    return new Response(JSON.stringify(body), { status: 200 });
}

describe("listEvents", () => {
    it("returns single page when has_more is false", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            eventsResponse(["evt_1", "evt_2"], false),
        );
        const events = await listEvents("https://api.example.test", "sk_test_x");
        assert.deepStrictEqual(
            events.map((e) => e.id),
            ["evt_1", "evt_2"],
        );
    });

    it("follows has_more across pages using last_id", async (t: TestContext) => {
        const calls: Array<string | null> = [];
        t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
            const url = input instanceof URL ? input : new URL(String(input));
            calls.push(url.searchParams.get("starting_after"));
            if (calls.length === 1) return eventsResponse(["evt_1", "evt_2"], true, "evt_2");
            return eventsResponse(["evt_3"], false);
        });
        const events = await listEvents("https://api.example.test", "sk_test_x");
        assert.deepStrictEqual(
            events.map((e) => e.id),
            ["evt_1", "evt_2", "evt_3"],
        );
        assert.deepStrictEqual(calls, [null, "evt_2"]);
    });

    it("falls back to last event id when last_id is missing but has_more is true", async (t: TestContext) => {
        const calls: Array<string | null> = [];
        t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
            const url = input instanceof URL ? input : new URL(String(input));
            calls.push(url.searchParams.get("starting_after"));
            if (calls.length === 1) return eventsResponse(["a", "b", "c"], true); // no last_id!
            return eventsResponse(["d"], false);
        });
        const events = await listEvents("https://api.example.test", "sk_test_x");
        assert.deepStrictEqual(
            events.map((e) => e.id),
            ["a", "b", "c", "d"],
        );
        assert.deepStrictEqual(calls, [null, "c"]);
    });

    it("sends default limit=100", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
            const url = input instanceof URL ? input : new URL(String(input));
            assert.strictEqual(url.searchParams.get("limit"), "100");
            return eventsResponse([], false);
        });
        await listEvents("https://api.example.test", "sk_test_x");
    });
});

describe("listEvents pageSize option", () => {
    it("respects custom pageSize", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
            const url = input instanceof URL ? input : new URL(String(input));
            assert.strictEqual(url.searchParams.get("limit"), "250");
            return eventsResponse([], false);
        });
        await listEvents("https://api.example.test", "sk_test_x", { pageSize: 250 });
    });

    it("throws RangeError when pageSize > 1000", async () => {
        await assert.rejects(
            () => listEvents("https://api.example.test", "sk_test_x", { pageSize: 1001 }),
            RangeError,
        );
    });

    it("throws RangeError when pageSize < 1", async () => {
        await assert.rejects(
            () => listEvents("https://api.example.test", "sk_test_x", { pageSize: 0 }),
            RangeError,
        );
    });
});
