import { writeFileSync } from "node:fs";

const solution = `export function solution(input: unknown): unknown {
  return input;
}
`;

const test = `import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { solution } from "./solution.ts";

describe("solution", () => {
  it("placeholder", () => {
    assert.deepStrictEqual(solution(42), 42);
  });
});
`;

writeFileSync("solution.ts", solution);
writeFileSync("solution.test.ts", test);
console.log("Reset solution.ts and solution.test.ts");
