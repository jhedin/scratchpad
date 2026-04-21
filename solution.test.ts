import assert from "node:assert/strict";
import { describe, it } from "node:test";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.throws(() => fn())    — expects an error
import { solution } from "./solution.ts";

describe("solution", () => {
    it("finds the shortest substring of s that contains every character of t", () => {

        const s = "ADOBECODEBANC";
        const t = "ABC";

        const props = { s, t };
        const expected = "BANC";
        assert.deepStrictEqual(solution(props), expected);
    });

});
