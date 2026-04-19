import assert from "node:assert/strict";
import { describe, it } from "node:test";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.throws(() => fn())    — expects an error
import { solution } from "./solution.ts";

describe("solution", () => {
    it("sums the transactions", () => {

        const transactions = [
            { merchant: "m1", amount: 100, timestamp: "2024-01-01T10:00:00Z" },
            { merchant: "m2", amount: 200, timestamp: "2024-01-01T11:00:00Z" },
            { merchant: "m1", amount: 50, timestamp: "2024-01-01T14:00:00Z" },
            { merchant: "m2", amount: 75, timestamp: "2024-01-01T16:00:00Z" },
            { merchant: "m1", amount: -30, timestamp: "2024-01-01T17:00:00Z" }, // refund    
            { merchant: "m2", amount: 75, timestamp: "2024-01-02T16:00:00Z" },
        ];

        const props = { transactions };
        const expected =
            [
                { merchant: "m1", payout: 120, fees: 5 },
                { merchant: "m2", payout: 350, fees: 10 },
            ]
        assert.deepStrictEqual(solution(props), expected);
    });
    it("empty transactions makes empty payouts", () => {

        const props = { transactions: [] };
        const expected = [];
        assert.deepStrictEqual(solution(props), expected);
    });
});
