import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { subsets } from "./solution.ts";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.throws(() => fn())    — expects an error
describe("subsetSum generator", () => {
    it("yields all subsets", () => {
        const results = [...subsets([1, 2, 3])].map(subset => {
            subset["sum"] = subset.reduce((sum, next) => sum + next, 0)
            return subset
        })
        console.table(results);
        assert.equal(results.length, 8);  // 2^3 subsets                                                                                                                                                        
    });
});
