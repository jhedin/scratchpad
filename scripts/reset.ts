import { writeFileSync } from "node:fs";
import { execSync as exec } from "node:child_process";

const placeholder = {
  solution: `interface Props {
  nums: number[];
  target: number;
}

export function solution({ nums, target }: Props): number[] {
  const seen = new Map<number, number>();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (seen.has(complement)) {
      return [seen.get(complement)!, i];
    }
    seen.set(nums[i], i);
  }
  throw new Error("No solution found");
}
`,
  test: `import { describe, it } from "node:test";
import assert from "node:assert/strict";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.throws(() => fn())    — expects an error
import { solution } from "./solution.ts";

describe("solution", () => {
  it("finds two numbers that add up to target", () => {
    const props = { nums: [2, 7, 11, 15], target: 9 };
    assert.deepStrictEqual(solution(props), [0, 1]);
  });

  it("works when answer is not at the start", () => {
    const props = { nums: [3, 2, 4], target: 6 };
    assert.deepStrictEqual(solution(props), [1, 2]);
  });

  it("handles duplicate values", () => {
    const props = { nums: [3, 3], target: 6 };
    assert.deepStrictEqual(solution(props), [0, 1]);
  });
});
`,
};

const diff = exec("git diff solution.ts solution.test.ts", { encoding: "utf8" });

let branch = "solution";
if (diff.trim()) {
  console.log("Asking Claude to name the branch...");
  const raw = exec(
    `claude -p "Output only a short git branch name (kebab-case, no prefix, max 4 words) that describes this solution. No explanation, no punctuation, just the branch name.\n\n${diff}"`,
    { encoding: "utf8" }
  ).trim();
  const match = raw.match(/^[a-z0-9]+(?:-[a-z0-9]+)*$/m);
  branch = match ? match[0] : "solution";
  console.log(`Saving to branch: ${branch}`);
  exec(`git checkout -b ${branch}`);
  exec("git add solution.ts solution.test.ts");
  exec(`git commit -m "feat: ${branch}"`);
  exec("git push -u origin HEAD");
  exec("git checkout main");
} else {
  console.log("No changes to save.");
}

writeFileSync("solution.ts", placeholder.solution);
writeFileSync("solution.test.ts", placeholder.test);
console.log("Reset solution.ts and solution.test.ts");
