import assert from "node:assert/strict";
import { describe, it } from "node:test";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.throws(() => fn())    — expects an error
import { solution } from "./solution.ts";

describe("solution", () => {
    it("finds two numbers that add up to target", () => {


        const bin = "424242";
        const intervals = [
            { start: "1000000000", end: "1999999999", label: "merchant_a" },
            { start: "5000000000", end: "5999999999", label: "merchant_b" },
        ];

        const props = { intervals, bin };
        const expected = [
            { start: "0000000000", end: "0999999999", label: "unclaimed" },
            { start: "1000000000", end: "1999999999", label: "merchant_a" },
            { start: "2000000000", end: "4999999999", label: "unclaimed" },
            { start: "5000000000", end: "5999999999", label: "merchant_b" },
            { start: "6000000000", end: "9999999999", label: "unclaimed" },
        ];
        assert.deepStrictEqual(solution(props), expected);
    });

});
