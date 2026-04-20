import assert from "node:assert/strict";
import { describe, it } from "node:test";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.throws(() => fn())    — expects an error
import { solution } from "./solution.ts";

describe("solution", () => {
    it("matches refunds to charges", () => {

        const charges = [
            { id: "c1", amount: 100 },
            { id: "c2", amount: 50 },
            { id: "c3", amount: 75 },
        ];
        const refunds = [
            { charge_id: "c1", amount: 30 },
            { charge_id: null, amount: 50 },  // orphan, matches c2 exactly
            { charge_id: null, amount: 75 },  // orphan, matches c3 exactly
        ];
        const props = { charges, refunds };
        const expected = [
            { id: "c1", net: 70 },
            { id: "c2", net: 0 },
            { id: "c3", net: 0 },
        ];

        assert.deepStrictEqual(solution(props), expected);
    });

    it("makes sure net stays >= 0", () => {

        const charges = [
            { id: "c1", amount: 100 },
            { id: "c2", amount: 100 },
            { id: "c3", amount: 50 },
        ];
        const refunds = [
            { charge_id: "c1", amount: 60 },    // c1 now has 40 remaining
            { charge_id: null, amount: 100 },   // must match c2 (c1 only has 40 left, c3 is 50)
            { charge_id: null, amount: 50 },    // matches c3
        ];
        const props = { charges, refunds };
        const expected = [
            { id: "c1", net: 40 },
            { id: "c2", net: 0 },
            { id: "c3", net: 0 },
        ];

        assert.deepStrictEqual(solution(props), expected);
    });

    it("makes sure to update the net as it assigns ids to refunds", () => {
        const charges = [
            { id: "c1", amount: 100 },
            { id: "c2", amount: 100 },
        ];
        const refunds = [
            { charge_id: null, amount: 100 },
            { charge_id: null, amount: 100 },
        ];
        const props = { charges, refunds };
        const expected = [
            { id: "c1", net: 0 },
            { id: "c2", net: 0 },
        ];

        assert.deepStrictEqual(solution(props), expected);
    })


    it("no matching refunds", () => {

        const charges = [
            { id: "c1", amount: 100 },
            { id: "c2", amount: 200 },
            { id: "c3", amount: 50 },
        ];
        const refunds = [
            { charge_id: "c7", amount: 30 },
        ];

        const props = { charges, refunds };
        const expected = [
            { id: "c1", net: 100 },
            { id: "c2", net: 200 },
            { id: "c3", net: 50 },
        ];
        assert.deepStrictEqual(solution(props), expected);
    });
});
