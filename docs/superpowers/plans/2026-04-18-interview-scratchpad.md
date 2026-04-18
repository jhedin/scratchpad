# Interview Scratchpad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up a zero-dependency TypeScript interview scratchpad with native Node test runner, type checking, VS Code integration, GitHub repo, and a `scratch` shell command.

**Architecture:** Single solution/test file pair at the repo root, run with Node's `--experimental-strip-types` flag. TypeScript installed only for `tsc --noEmit` type checking. A `scratch <name>` function in `.zshrc` clones the repo and opens VS Code.

**Tech Stack:** Node 22, TypeScript (devDependency), `node:test`, `node:assert`, GitHub CLI (`gh`)

---

## File Map

| File               | Action | Purpose                     |
| ------------------ | ------ | --------------------------- |
| `package.json`     | Create | Scripts: test, watch, types |
| `tsconfig.json`    | Create | Editor IntelliSense only    |
| `solution.ts`      | Create | Starter solution file       |
| `solution.test.ts` | Create | Starter test file           |
| `.gitignore`       | Create | Ignore node_modules         |
| `~/.zshrc`         | Modify | Add `scratch` function      |

---

### Task 1: Initialize package.json

**Files:**

- Create: `package.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "scratchpad",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "node --experimental-strip-types --test solution.test.ts",
    "watch": "node --experimental-strip-types --test --watch solution.test.ts",
    "types": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install`
Expected: `node_modules/` created, `package-lock.json` written, no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: init package.json with test/watch/types scripts"
```

---

### Task 2: Add tsconfig.json

**Files:**

- Create: `tsconfig.json`

- [ ] **Step 1: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["*.ts"]
}
```

- [ ] **Step 2: Verify tsc sees the config**

Run: `npm run types`
Expected: No output, exit code 0. (No .ts files yet is fine — tsc won't error on empty include.)

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore: add tsconfig for editor IntelliSense"
```

---

### Task 3: Add starter solution and test files

**Files:**

- Create: `solution.ts`
- Create: `solution.test.ts`

- [ ] **Step 1: Create solution.ts**

```typescript
export function solution(input: unknown): unknown {
  return input;
}
```

- [ ] **Step 2: Create solution.test.ts**

```typescript
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { solution } from "./solution.ts";

describe("solution", () => {
  it("returns input unchanged (placeholder)", () => {
    assert.deepStrictEqual(solution(42), 42);
  });
});
```

- [ ] **Step 3: Run the tests**

Run: `npm test`
Expected output contains:

```
▶ solution
  ✔ returns input unchanged (placeholder)
▶ solution (Xms)
```

- [ ] **Step 4: Run type check**

Run: `npm run types`
Expected: No output, exit code 0.

- [ ] **Step 5: Commit**

```bash
git add solution.ts solution.test.ts
git commit -m "feat: add starter solution and test files"
```

---

### Task 4: Add .gitignore

**Files:**

- Create: `.gitignore`

- [ ] **Step 1: Create .gitignore**

```
node_modules/
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add gitignore"
```

---

### Task 5: Push to GitHub

**Files:** none

- [ ] **Step 1: Create GitHub repo**

Run:

```bash
gh repo create scratchpad --public --source=. --remote=origin --push
```

Expected: Repo created at `https://github.com/jhedin/scratchpad`, all commits pushed.

- [ ] **Step 2: Verify**

Run: `git log --oneline origin/main`
Expected: All 4 commits visible.

---

### Task 6: Add `scratch` shell command to .zshrc

**Files:**

- Modify: `~/.zshrc`

- [ ] **Step 1: Read current end of .zshrc to find insertion point**

Run: `tail -5 ~/.zshrc`

- [ ] **Step 2: Append the scratch function**

Add to the end of `~/.zshrc`:

```zsh
scratch() {
  if [[ -z "$1" ]]; then
    echo "Usage: scratch <name>"
    return 1
  fi
  local dest="$HOME/workspace/$1"
  git clone https://github.com/jhedin/scratchpad "$dest" && code "$dest"
}
```

- [ ] **Step 3: Reload and test**

Run:

```bash
source ~/.zshrc
type scratch
```

Expected:

```
scratch is a shell function
```

- [ ] **Step 4: Smoke test (dry run)**

Run: `scratch` (no args)
Expected: `Usage: scratch <name>`

---

### Task 7: Verify VS Code debugger launch config

**Files:**

- Create: `.vscode/launch.json`

- [ ] **Step 1: Create launch config**

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug solution.test.ts",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/solution.test.ts",
      "runtimeArgs": [
        "--experimental-strip-types",
        "--test",
        "--inspect-brk=0"
      ],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add .vscode/launch.json
git commit -m "chore: add VS Code debug launch config"
git push
```

- [ ] **Step 3: Verify in VS Code**

Open the repo in VS Code. Set a breakpoint in `solution.test.ts`. Press F5 — debugger should pause at the breakpoint.
