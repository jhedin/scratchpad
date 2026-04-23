import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultFetcher, fetchMany, type Result } from "./solution.ts";

function delay<T>(ms: number, value: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

describe("fetchMany (node-fetch variant)", () => {
    it("returns results in URL input order", async () => {
        const urls = ["a", "b", "c", "d", "e"];
        const out = await fetchMany(urls, {
            fetcher: async (u) => delay((6 - u.charCodeAt(0) + 96) * 5, u.toUpperCase()),
            concurrency: 3,
        });
        assert.deepStrictEqual(out, ["A", "B", "C", "D", "E"]);
    });

    it("caps concurrency", async () => {
        let inFlight = 0;
        let maxInFlight = 0;
        const urls = Array.from({ length: 20 }, (_, i) => String(i));
        await fetchMany(urls, {
            fetcher: async (u) => {
                inFlight++;
                maxInFlight = Math.max(maxInFlight, inFlight);
                await delay(5, null);
                inFlight--;
                return u;
            },
            concurrency: 4,
        });
        assert.ok(maxInFlight <= 4, `maxInFlight should be <= 4, got ${maxInFlight}`);
        assert.ok(maxInFlight >= 2);
    });

    it("throws on first fetcher error", async () => {
        await assert.rejects(() =>
            fetchMany(["a", "b", "c"], {
                fetcher: async (u) => {
                    if (u === "b") throw new Error("boom");
                    return u;
                },
                concurrency: 2,
            }),
        );
    });

    it("handles empty input", async () => {
        const out = await fetchMany([], { fetcher: async (u: string) => u, concurrency: 5 });
        assert.deepStrictEqual(out, []);
    });
});

describe("defaultFetcher", () => {
    it("is exported and rejects when URL is unreachable", async () => {
        // Use a localhost port that should reject connection — we're only verifying the function exists
        // and throws rather than hangs.
        await assert.rejects(() => defaultFetcher("http://127.0.0.1:1/nonexistent"));
    });
});

describe("fetchMany onError: 'collect'", () => {
    it("returns all outcomes without throwing", async () => {
        const out = await fetchMany(["a", "b", "c", "d"], {
            fetcher: async (u) => {
                if (u === "b") throw new Error("fail-b");
                return u.toUpperCase();
            },
            concurrency: 2,
            onError: "collect",
        });
        assert.strictEqual(out.length, 4);
        assert.deepStrictEqual(out[0], { ok: true, value: "A" });
        assert.strictEqual((out[1] as Result<string>).ok, false);
        assert.deepStrictEqual(out[2], { ok: true, value: "C" });
        assert.deepStrictEqual(out[3], { ok: true, value: "D" });
    });
});
