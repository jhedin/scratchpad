import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { defaultFetcher, fetchMany } from "./solution.ts";

function delay<T>(ms: number, value: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

describe("fetchMany (node-fetch variant)", () => {
    it("returns results in URL input order", async () => {
        const urls = ["a", "b", "c", "d", "e"];
        const out = await fetchMany(urls, async (u) => delay((6 - u.charCodeAt(0) + 96) * 5, u.toUpperCase()), 3);
        assert.deepStrictEqual(out, ["A", "B", "C", "D", "E"]);
    });

    it("caps concurrency", async () => {
        let inFlight = 0;
        let maxInFlight = 0;
        const urls = Array.from({ length: 20 }, (_, i) => String(i));
        await fetchMany(
            urls,
            async (u) => {
                inFlight++;
                maxInFlight = Math.max(maxInFlight, inFlight);
                await delay(5, null);
                inFlight--;
                return u;
            },
            4,
        );
        assert.ok(maxInFlight <= 4, `maxInFlight should be <= 4, got ${maxInFlight}`);
        assert.ok(maxInFlight >= 2);
    });

    it("throws on first fetcher error", async () => {
        await assert.rejects(() =>
            fetchMany(["a", "b", "c"], async (u) => {
                if (u === "b") throw new Error("boom");
                return u;
            }, 2),
        );
    });

    it("handles empty input", async () => {
        const out = await fetchMany([], async (u: string) => u, 5);
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
