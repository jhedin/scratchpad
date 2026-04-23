import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { solution } from "./solution.ts";

describe("subset sum DP", () => {
    it("finds a subset summing to target", () => {
        const result = solution({ nums: [3, 34, 4, 12, 5, 2], target: 9 });
        assert.equal(result.found, true);
        assert.equal(result.subset.reduce((a, b) => a + b, 0), 9);
        for (const n of result.subset) {
            assert.ok([3, 34, 4, 12, 5, 2].includes(n));
        }
    });

    it("returns found=false when no subset sums to target", () => {
        const result = solution({ nums: [3, 34, 4, 12, 5, 2], target: 30 });
        assert.equal(result.found, false);
        assert.deepStrictEqual(result.subset, []);
    });

    it("handles target 0 as the empty subset", () => {
        const result = solution({ nums: [1, 2, 3], target: 0 });
        assert.equal(result.found, true);
        assert.deepStrictEqual(result.subset, []);
    });

    it("handles single-element exact match", () => {
        const result = solution({ nums: [5, 10, 15], target: 10 });
        assert.equal(result.found, true);
        assert.deepStrictEqual(result.subset, [10]);
    });

    it("uses each element at most once", () => {
        // target=10 from [3] alone is impossible — would need 3+3+3+1
        const result = solution({ nums: [3], target: 6 });
        assert.equal(result.found, false);
    });

    it("finds a subset using a mix of small and large numbers", () => {
        const result = solution({ nums: [1, 2, 3, 4, 5], target: 11 });
        assert.equal(result.found, true);
        assert.equal(result.subset.reduce((a, b) => a + b, 0), 11);
    });
});
