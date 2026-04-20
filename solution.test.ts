import assert from "node:assert/strict";
import { describe, it } from "node:test";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.throws(() => fn())    — expects an error
import { solution } from "./solution.ts";

describe("solution", () => {
    it("converts with the right rate", () => {


        const conversions = [
            { from: "USD", to: "GBP", amount: 100 },
            { from: "USD", to: "JPY", amount: 200 },
            { from: "EUR", to: "GBP", amount: 50 },
        ];

        const rates = [
            { from: "USD", to: "EUR", rate: 0.9, activation_cost: 10 },
            { from: "EUR", to: "GBP", rate: 0.85, activation_cost: 5 },
            { from: "USD", to: "GBP", rate: 0.7, activation_cost: 20 },
            { from: "USD", to: "JPY", rate: 150, activation_cost: 8 },
            { from: "EUR", to: "JPY", rate: 165, activation_cost: 15 },
        ];

        const props = {
            rates,
            conversions
        };
        const expected = {
            conversion: 76.5
        };
        assert.deepStrictEqual(solution(props), expected);
    });

    it("fails when no matching edge", () => {
        const amount = 100;
        const from = "USD";
        const to = "EUR";

        const props = {
            rates: [],
            amount,
            from,
            to
        };
        const expected = {
            conversion: 90
        };

        assert.throws(() => solution(props))

    })

});
