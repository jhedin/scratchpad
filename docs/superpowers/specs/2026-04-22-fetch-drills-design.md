# Fetch Drills — Design Spec

Prep library for Stripe's onsite Integration round. 17 multi-part drills exercising `fetch`, auth, pagination, retry, idempotency, streaming, and unfamiliar-repo navigation. Prompts live in the interviewer repo; runnable starter code lives on named branches in scratchpad.

## Goal

Practice the skill Stripe's Integration round tests: given an unfamiliar repo, some API docs, and a data file, extend existing code to call an API and produce a result. Timed, error-path-before-happy-path, typing-speed-matters.

## What the round actually looks like (research summary)

From first-person accounts:

- Interviewer shares a Git repo link + API docs. Candidate clones, runs locally.
- Tasks arrive in 3–5 progressively harder parts ("ever-expanding" format).
- Repo usually contains pre-written boilerplate (a file reader, pinned libraries). Candidate extends, doesn't start from blank.
- Core operations: read JSON/CSV → HTTP call → parse response → file or console output.
- The fake API (e.g. "BikeMap") is a live endpoint hosted by Stripe, unrelated to Stripe's real API.
- 45–60 min total; ~10 min on intros + setup leaves 30–40 for code.
- Grading is on documentation literacy, naming, error handling, and composure — not algorithmic cleverness.

Sources consulted: stripe-interview/javascript-interview-prep starter repo, Ram Patra (Dublin), Diyaag (Medium), multiple LinkJob first-person accounts, Stripe rate-limit + error-handling docs.

## Scope

**In scope:**
- 17 drills with 3 parts each (most) or 1 part (capstone-style), stored as branches in the scratchpad repo.
- Prompt text (READMEs) stored in the interviewer repo alongside existing `drills.md`.
- Test harness pattern: `node:test` + `t.mock.method(globalThis, 'fetch', stub)`.
- One drill hits a real public API over the network.
- Library-variant drills covering `axios` and `node-fetch` idioms.

**Out of scope:**
- Canonical reference solutions. Past attempts on solution branches (via existing `reset.ts` workflow) serve as the reference corpus.
- Multi-language coverage. JS/TS only — Stripe confirms language ahead of time.
- Changes to the scratchpad `reset.ts` script.
- MSW or any other mocking library beyond `node:test`'s built-in `t.mock.method`.
- A drill-loader CLI. `git checkout <branch>` is the entry point.

## Architecture

### Repo responsibilities

**interviewer repo** (`/home/jhedin/workspace/interviewer`):
- Holds prompt text, organized by category.
- No runnable code, no solutions, no fixtures. Prose only.

**scratchpad repo** (`/home/jhedin/workspace/scratchpad`):
- Holds runnable starter code on named branches, one branch per drill-part.
- `main` branch has **two independent workspaces side by side**:
  - Root-level `solution.ts` + `solution.test.ts` — two-sum-style algorithmic drills. Unchanged from today.
  - A new sibling `fetch-scratch/` folder — fetch-drill workspace. Contains its own `solution.ts`, `solution.test.ts`, `lib/`, `fixtures/`, etc.
- **You only touch the folder for the kind of drill you're doing.** Algorithmic drill → work at root, leave `fetch-scratch/` alone. Fetch from-scratch drill → work in `fetch-scratch/`, leave root alone.
- Reset behavior is unchanged: it diffs root `solution.ts`/`solution.test.ts`, saves, and wipes back to the two-sum template. It does not touch `fetch-scratch/`. Saving work from a fetch drill is done by committing/branching `fetch-scratch/` manually (or by extending reset later — out of scope for this spec).
- Drill branches (the 17 ramp drills) are self-contained: each has its own `package.json`, fixtures, stub code, and README.

### Directory layout

Scratchpad repo on `main`:

```
scratchpad/
  solution.ts            # algorithmic drills (two-sum template)
  solution.test.ts       # algorithmic drills
  fetch-scratch/         # fetch from-scratch workspace
    solution.ts          # fetch-drill stub
    solution.test.ts     # has the t.mock.method(globalThis, 'fetch', ...) example
    package.json         # node-test, TypeScript, pinned fetch-adjacent deps
    tsconfig.json
    lib/
      fetch-json.ts      # tiny helper: wraps fetch + res.ok check + .json()
    fixtures/
      example.json       # example input file so you see how reading goes
      README.md          # notes on how fixtures are laid out
  scripts/reset.ts       # unchanged — only touches root solution.ts / solution.test.ts
  ...rest unchanged
```

Interviewer repo:

```
interviewer/drills/fetch/
  README.md                         # ramp + progress checklist
  basics/
    01-ping/README.md
    02-auth-get/README.md
    03-filtered-list/README.md
    04-error-bodies/README.md
  pagination/
    05-cursor/README.md
    06-link-header/README.md
  resilience/
    07-retry-5xx/README.md
    08-retry-429/README.md
    09-idempotency/README.md
    10-hmac-verify/README.md
  integration/
    11-concurrency-cap/README.md
    12-multipart-upload/README.md
    13-sse-stream/README.md
    14-real-api-capstone/README.md
  library-variants/
    15-axios-retry/README.md
    16-node-fetch-concurrency/README.md
  unfamiliar-repo/
    17-find-the-seam/README.md
```

Each `README.md` contains:
- 1–2 sentence scenario framing (the fake API this drill imitates).
- "Part 1", "Part 2", "Part 3" sections, each with a task and expected behavior.
- One deliberately buried quirk per drill (units in cents, off-by-one cursor semantics, UTC vs local time, etc.) — reward careful reading.
- Which scratchpad branch to check out to start.

### Branch naming

Scratchpad branches follow this pattern:

```
drill-NN-<slug>-part-K
```

Examples: `drill-01-ping-part-1`, `drill-07-retry-5xx-part-2`, `drill-14-real-api-capstone` (no `-part-K` for single-part drills).

**Branching topology:** each part branches from a pre-solved version of the previous part, not from `main`. That way Part 2 already contains a working Part 1 implementation as its starting point. Candidates don't have to migrate their own Part 1 code forward.

### What each drill branch contains

```
README.md           # prompt text copied from interviewer repo + branch-specific notes
package.json        # node-test, TypeScript, any library the drill exercises (axios, etc.)
tsconfig.json       # matches main branch
solution.ts         # stub with function signature and imports; body to fill in
solution.test.ts    # 2-3 pre-written tests showing the stub mocking pattern
fixtures/           # input data files the drill reads (optional, per drill)
  transactions.json
  users.csv
lib/                # pre-written helper modules (optional, per drill)
  read-csv.ts
```

Volume per drill: ~30-50 lines of pre-written code ("realistic" per the earlier scoping — not minimal, not heavy). Capstone (14) and unfamiliar-repo (17) are heavier: 80–120 lines spread across 4–5 files.

### Test harness pattern

Every drill's tests use `t.mock.method(globalThis, 'fetch', stub)`. Example shape:

```ts
import { describe, it, type TestContext } from "node:test";
import assert from "node:assert/strict";
import { solution } from "./solution.ts";

describe("solution", () => {
  it("calls the status endpoint and returns true when healthy", (t: TestContext) => {
    t.mock.method(globalThis, "fetch", async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200 })
    );
    assert.strictEqual(await solution(), true);
  });

  it("returns false when the endpoint fails", (t: TestContext) => {
    t.mock.method(globalThis, "fetch", async () => {
      throw new Error("network");
    });
    assert.strictEqual(await solution(), false);
  });
});
```

Drill 14 (capstone) additionally spins up a real `node:http` server bound to port 0 and passes the port to the solution via `baseUrl`. Drills 15–16 (library variants) mock the library's entrypoint instead of `globalThis.fetch`.

### Workflow

Practicing a drill:

```
# start
git checkout drill-07-retry-5xx-part-1
npm install      # only needed once per branch
npm test         # or npm run watch

# solve it
# edit solution.ts

# finish
npm run reset    # saves attempt to a named solution branch via claude-p (existing behavior)

# next part
git checkout drill-07-retry-5xx-part-2
```

The `reset` script behavior doesn't change. It diffs root `solution.ts`/`solution.test.ts`, asks claude-p to name a branch, commits and pushes, then overwrites those two files with the two-sum template. Important consequence: **running `reset` on a drill branch overwrites the drill's starter files with the two-sum template on that branch**, which is usually not what you want. Preferred workflow on drill branches: don't run `reset`. Instead, commit your attempt with a descriptive branch name (`git checkout -b my-drill-07-attempt && git commit -am ...`), then `git checkout drill-07-retry-5xx-part-1` to return to the clean starter — git restores the files for you. Reset is for the root algorithmic workflow only.

## Drill ramp (17 drills, 5 phases)

| # | Drill | New skill | Phase |
|---|---|---|---|
| 1 | Ping | fetch + t.mock.method | 1. Fundamentals |
| 2 | Auth'd GET | bearer header | 1 |
| 3 | Filtered List | URLSearchParams | 1 |
| 4 | Error Bodies | parse 4xx error JSON, throw with context | 1 |
| 5 | Cursor Pagination | `starting_after` loop | 2. Pagination |
| 6 | Link-Header Pagination | parse `Link: <>; rel="next"` | 2 |
| 7 | Retry on 5xx | backoff + jitter, classify retryable | 3. Resilience |
| 8 | 429 + Retry-After | honor `Retry-After`, fallback to backoff | 3 |
| 9 | Idempotency Keys | generate once, reuse across retries | 3 |
| 10 | HMAC Webhook Verify | `node:crypto`, constant-time compare, timestamp skew | 3 |
| 11 | Concurrency Cap | pool pattern (not `Promise.all`) | 4. Integration |
| 12 | Multipart Upload | FormData + Blob + binary | 4 |
| 13 | SSE Stream | ReadableStream + async generator | 4 |
| 14 | Real-API Capstone | everything, real network (public API) | 4 |
| 15 | Axios Retry | same skill as Drill 7, rewritten in axios | 5. Library variants |
| 16 | node-fetch Concurrency | same skill as Drill 11, rewritten in node-fetch | 5 |
| 17 | Find the Seam | navigate 5-file unfamiliar repo, single part | 6. Unfamiliar repo |

Each drill reads at least one input file (fixtures/*.json or *.csv). Each README buries one quirk that rewards careful reading.

## Implementation plan (high level)

Work happens in the scratchpad repo using `git worktree` so main stays clean:

```
git worktree add ../sp-authoring -b drill-01-ping-part-1
cd ../sp-authoring
# write starter code, README, tests
git commit -am "drill 01 part 1 starter"
git push -u origin drill-01-ping-part-1

# for part 2, branch off a pre-solved part 1
git checkout -b drill-01-ping-part-2
# apply reference part 1 solution, add part 2 extensions
git commit -am "drill 01 part 2 starter"
git push -u origin drill-01-ping-part-2

# ...part 3...
cd -
git worktree remove ../sp-authoring
```

Order of work: prompts first (interviewer repo), then starters for all 14 `fetch` drills, then library variants, then unfamiliar-repo capstone. Drills can be authored out of order, but within a drill, parts must be authored 1 → 2 → 3 since later parts branch from earlier ones.

## Open risks

- **Drill authoring is substantial.** 17 drills × ~3 branches × ~40 lines of starter = ~2000 lines of prompt and scaffold. Worth the investment only if at least 6–8 drills get used in practice.
- **Branches drift from main.** If `package.json`, `tsconfig.json`, or `reset.ts` change on main, drill branches won't inherit. Decision: accept this. Drill branches pin their own minimal `package.json`. Main can evolve; drill branches can be re-created if they become incompatible.
- **`t.mock.method` on `globalThis.fetch` is shared state.** Already mitigated by `--test-concurrency=1` in `package.json`. If concurrency is ever increased, tests will intermittently fail.
