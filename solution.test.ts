import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { solution } from "./solution.ts";

describe("coin change min coins", () => {
    it("makes 11 from [1,2,5] in 3 coins (5+5+1)", () => {
        assert.equal(solution({ coins: [1, 2, 5], target: 11 }), 3);
    });

    it("returns -1 when target unreachable", () => {
        assert.equal(solution({ coins: [2], target: 3 }), -1);
    });

    it("returns 0 when target is 0", () => {
        assert.equal(solution({ coins: [1, 2, 5], target: 0 }), 0);
    });

    it("uses a single coin when an exact match exists", () => {
        assert.equal(solution({ coins: [1, 5, 10], target: 10 }), 1);
    });

    it("prefers fewer larger coins over many small ones", () => {
        assert.equal(solution({ coins: [1, 7, 10], target: 14 }), 2);  // 7+7, not 10+1+1+1+1
    });

    it("handles a case where greedy from largest fails", () => {
        // Greedy from largest: 6 + 1 + 1 + 1 = 4 coins
        // Optimal: 6 + 3 = 2 coins
        assert.equal(solution({ coins: [1, 3, 4, 6], target: 9 }), 2);
    });

    it("returns -1 when no coins at all", () => {
        assert.equal(solution({ coins: [], target: 5 }), -1);
    });
});
