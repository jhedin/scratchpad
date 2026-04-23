import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fetchMany } from "./solution.ts";

function delay<T>(ms: number, value: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

describe("fetchMany", () => {
    it("returns results in input order despite variable completion time", async () => {
        const items = [1, 2, 3, 4, 5];
        const out = await fetchMany(items, (n) => delay((6 - n) * 10, n * 10), 3);
        assert.deepStrictEqual(out, [10, 20, 30, 40, 50]);
    });

    it("never has more than `concurrency` in flight at once", async () => {
        let inFlight = 0;
        let maxInFlight = 0;
        const items = Array.from({ length: 20 }, (_, i) => i);
        await fetchMany(
            items,
            async (n) => {
                inFlight++;
                maxInFlight = Math.max(maxInFlight, inFlight);
                await delay(5, null);
                inFlight--;
                return n;
            },
            4,
        );
        assert.ok(maxInFlight <= 4, `maxInFlight should be <= 4, got ${maxInFlight}`);
        assert.ok(maxInFlight >= 2, `should actually parallelize; maxInFlight was ${maxInFlight}`);
    });

    it("rejects on first fetcher error", async () => {
        await assert.rejects(
            () =>
                fetchMany([1, 2, 3], async (n) => {
                    if (n === 2) throw new Error("boom");
                    return n;
                }, 2),
            (err: Error) => err.message === "boom",
        );
    });

    it("handles empty input", async () => {
        const out = await fetchMany([], async (n: number) => n, 5);
        assert.deepStrictEqual(out, []);
    });
});
