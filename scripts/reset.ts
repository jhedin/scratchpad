import { writeFileSync } from "node:fs";
import { execSync as exec } from "node:child_process";

const placeholder = {
  solution: `export function solution(input: unknown): unknown {
  return input;
}
`,
  test: `import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { solution } from "./solution.ts";

describe("solution", () => {
  it("placeholder", () => {
    assert.deepStrictEqual(solution(42), 42);
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
