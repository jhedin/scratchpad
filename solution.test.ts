import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { twoSum } from "./solution.ts";

describe("twoSum", () => {
  it("finds two numbers that add up to target", () => {
    assert.deepStrictEqual(twoSum([2, 7, 11, 15], 9), [0, 1]);
  });

  it("works when answer is not at the start", () => {
    assert.deepStrictEqual(twoSum([3, 2, 4], 6), [1, 2]);
  });

  it("handles duplicate values", () => {
    assert.deepStrictEqual(twoSum([3, 3], 6), [0, 1]);
  });
});
