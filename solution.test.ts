import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fetchMany } from "./solution.ts";

function delay<T>(ms: number, value: T): Promise<T> {
    return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

describe("fetchMany", () => {
    it("returns results in input order despite variable completion time", async () => {
        const items = [1, 2, 3, 4, 5];
        const out = await fetchMany(items, (n) => delay((6 - n) * 10, n * 10), { concurrency: 3 });
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
            { concurrency: 4 },
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
                }, { concurrency: 2 }),
            (err: Error) => err.message === "boom",
        );
    });

    it("handles empty input", async () => {
        const out = await fetchMany([], async (n: number) => n, { concurrency: 5 });
        assert.deepStrictEqual(out, []);
    });
});

describe("fetchMany options", () => {
    it("default concurrency is 5", async () => {
        let inFlight = 0;
        let maxInFlight = 0;
        const items = Array.from({ length: 20 }, (_, i) => i);
        await fetchMany(items, async (n) => {
            inFlight++;
            maxInFlight = Math.max(maxInFlight, inFlight);
            await delay(5, null);
            inFlight--;
            return n;
        });
        assert.ok(maxInFlight <= 5 && maxInFlight >= 2);
    });
});

describe("fetchMany onError: 'collect'", () => {
    it("returns all outcomes (ok/err) without throwing", async () => {
        const out = await fetchMany(
            [1, 2, 3, 4],
            async (n) => {
                if (n === 2) throw new Error("fail-2");
                return n * 10;
            },
            { concurrency: 2, onError: "collect" },
        );
        assert.strictEqual(out.length, 4);
        assert.deepStrictEqual(out[0], { ok: true, value: 10 });
        assert.strictEqual(out[1]!.ok, false);
        assert.deepStrictEqual(out[2], { ok: true, value: 30 });
        assert.deepStrictEqual(out[3], { ok: true, value: 40 });
    });
});

describe("fetchMany fail-fast stops dispatching but lets in-flight finish", () => {
    it("does not start items beyond the failing one", async () => {
        const started: number[] = [];
        const completed: number[] = [];
        await assert.rejects(() =>
            fetchMany(
                [1, 2, 3, 4, 5, 6],
                async (n) => {
                    started.push(n);
                    if (n === 3) {
                        await delay(5, null);
                        throw new Error("fail-3");
                    }
                    await delay(10, null);
                    completed.push(n);
                    return n;
                },
                { concurrency: 2 },
            ),
        );
        // Item 3 triggered abort; items 5 and 6 should NOT have started.
        assert.ok(!started.includes(5), "item 5 should not have started");
        assert.ok(!started.includes(6), "item 6 should not have started");
    });
});
