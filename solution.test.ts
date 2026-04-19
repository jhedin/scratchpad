import { describe, it } from "node:test";
import assert from "node:assert/strict";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.throws(() => fn())    — expects an error
import { solution } from "./solution.ts";

describe("solution", () => {
  it("finds two numbers that add up to target", () => {
    const props = { nums: [2, 7, 11, 15], target: 9 };
    const expected = [0, 1];
    assert.deepStrictEqual(solution(props), expected);
  });

  it("works when answer is not at the start", () => {
    const props = { nums: [3, 2, 4], target: 6 };
    const expected = [1, 2];
    assert.deepStrictEqual(solution(props), expected);
  });

  it("handles duplicate values", () => {
    const props = { nums: [3, 3], target: 6 };
    const expected = [0, 1];
    assert.deepStrictEqual(solution(props), expected);
  });
});
