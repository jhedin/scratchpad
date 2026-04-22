# Fetch Drills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 17-drill library for practicing Stripe's onsite Integration round. Prompts live in the `interviewer` repo; runnable starter code lives on named branches in the `scratchpad` repo. Root of `scratchpad` keeps its existing algorithmic-drill workspace; a new sibling `fetch-scratch/` folder hosts from-scratch fetch work.

**Architecture:** Three-phase rollout.

1. **Base commit** on `scratchpad:main` adds the `fetch-scratch/` workspace and a drill-branch README template. This is the ancestor of every drill branch.
2. **Parallel authoring** via one git worktree per drill, each worked by a subagent. Each worktree produces N branches (one per part) pushed to origin.
3. **Interviewer-repo index** collects prompts and points at the branch names produced in phase 2.
4. **Cleanup** removes all authoring worktrees; branches remain on origin + locally.

**Tech Stack:**
- Node.js ≥ 22 (for `--experimental-strip-types` and `node:test` with `t.mock.method`)
- TypeScript via `--experimental-strip-types`, no transpile step
- `node:test` + `node:assert/strict` test runner
- `node-fetch`, `axios` as dependencies only in the library-variant drill branches that need them
- `git worktree` for authoring isolation

**Reference spec:** `docs/superpowers/specs/2026-04-22-fetch-drills-design.md`

---

## Phase 0: Preflight

### Task 0.1: Verify clean state

**Files:** none — inspection only.

- [ ] **Step 1: Confirm scratchpad `main` is clean before starting**

Run:
```bash
cd /home/jhedin/workspace/scratchpad
git status
```

Expected: working tree clean on `main`, or only modifications to `solution.ts` / `solution.test.ts` that the user has explicitly said are OK to discard. If there are other modified files, stop and surface them to the user.

- [ ] **Step 2: Confirm interviewer `main` is clean**

Run:
```bash
cd /home/jhedin/workspace/interviewer
git status
```

Expected: working tree clean, or the user has acknowledged any in-flight edits (e.g. `INTERVIEWER.md`). Surface and stop if anything else is dirty.

- [ ] **Step 3: Confirm no leftover worktrees from previous runs**

Run:
```bash
cd /home/jhedin/workspace/scratchpad
git worktree list
```

Expected: only the main working directory. If stale worktrees are present, ask before removing them.

---

## Phase 1: Base commit on scratchpad

Goal: land the `fetch-scratch/` workspace and a reusable drill-branch template on `main`. Every drill branch will be created starting from this commit.

### Task 1.1: Create the fetch-scratch workspace

**Files:**
- Create: `scratchpad/fetch-scratch/package.json`
- Create: `scratchpad/fetch-scratch/tsconfig.json`
- Create: `scratchpad/fetch-scratch/solution.ts`
- Create: `scratchpad/fetch-scratch/solution.test.ts`
- Create: `scratchpad/fetch-scratch/lib/fetch-json.ts`
- Create: `scratchpad/fetch-scratch/fixtures/example.json`
- Create: `scratchpad/fetch-scratch/fixtures/README.md`
- Create: `scratchpad/fetch-scratch/README.md`

- [ ] **Step 1: Create `fetch-scratch/package.json`**

Run:
```bash
mkdir -p /home/jhedin/workspace/scratchpad/fetch-scratch/lib \
         /home/jhedin/workspace/scratchpad/fetch-scratch/fixtures
```

Write `scratchpad/fetch-scratch/package.json`:
```json
{
  "name": "fetch-scratch",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "test": "node --experimental-strip-types --test --test-concurrency=1 --test-reporter=spec solution.test.ts",
    "watch": "node --experimental-strip-types --test --test-concurrency=1 --test-reporter=spec --watch solution.test.ts",
    "types": "tsc --noEmit"
  },
  "devDependencies": {
    "@types/node": "^25.6.0",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: Create `fetch-scratch/tsconfig.json`**

Write `scratchpad/fetch-scratch/tsconfig.json` (mirrors the root `tsconfig.json` so the workspace type-checks standalone):
```json
{
  "compilerOptions": {
    "target": "ES2024",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "lib": ["ES2024"],
    "types": ["node"]
  },
  "include": ["**/*.ts"]
}
```

- [ ] **Step 3: Create the `lib/fetch-json.ts` helper**

Write `scratchpad/fetch-scratch/lib/fetch-json.ts`:
```ts
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${body}`);
    }
    return (await res.json()) as T;
}
```

- [ ] **Step 4: Create the fetch-style `solution.ts` stub**

Write `scratchpad/fetch-scratch/solution.ts`:
```ts


interface Props {
    baseUrl: string;
}

interface Result {
    ok: boolean;
}

export async function solution({ baseUrl }: Props): Promise<Result> {


    return { ok: false };
}
```

- [ ] **Step 5: Create the fetch-style `solution.test.ts` with the mock pattern**

Write `scratchpad/fetch-scratch/solution.test.ts`:
```ts
import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.rejects(() => fn())   — expects a promise rejection
import { solution } from "./solution.ts";

describe("solution", () => {
    it("returns ok:true when the status endpoint reports healthy", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            new Response(JSON.stringify({ ok: true }), { status: 200 }),
        );
        const result = await solution({ baseUrl: "https://example.test" });
        assert.deepStrictEqual(result, { ok: true });
    });

    it("returns ok:false when fetch throws", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () => {
            throw new Error("network");
        });
        const result = await solution({ baseUrl: "https://example.test" });
        assert.deepStrictEqual(result, { ok: false });
    });
});
```

- [ ] **Step 6: Create the example fixture and its README**

Write `scratchpad/fetch-scratch/fixtures/example.json`:
```json
{
    "items": [
        { "id": "evt_1", "amount_cents": 1250, "currency": "usd" },
        { "id": "evt_2", "amount_cents": 790, "currency": "usd" }
    ]
}
```

Write `scratchpad/fetch-scratch/fixtures/README.md`:
```md
# Fixtures

Input data for from-scratch fetch drills. Read these via `node:fs/promises`
`readFile(new URL("./fixtures/example.json", import.meta.url), "utf8")` and
`JSON.parse` — same idiom the real interview repos use.

Amounts are in cents (matches Stripe convention). Watch for off-by-one unit
conversions when tests compare against dollars.
```

- [ ] **Step 7: Create the workspace README**

Write `scratchpad/fetch-scratch/README.md`:
```md
# fetch-scratch

From-scratch workspace for fetch-style integration drills. Separate from the
root `solution.ts` so you never mix algorithmic-drill work with HTTP-drill work.

## Run
```
cd fetch-scratch
npm install            # once
npm test
npm run watch          # rerun on change
```

## What's here
- `solution.ts` — your active work
- `solution.test.ts` — has the `t.mock.method(globalThis, "fetch", ...)` pattern
- `lib/fetch-json.ts` — small helper; feel free to ignore or expand
- `fixtures/` — example input data

## Reset
`npm run reset` at the repo root only touches root `solution.ts` /
`solution.test.ts`. To reset this folder, use git: stash or check out a clean
version of `fetch-scratch/`.
```

- [ ] **Step 8: Verify the fetch-scratch workspace runs**

Run:
```bash
cd /home/jhedin/workspace/scratchpad/fetch-scratch
npm install
npm test
```

Expected:
- `npm install` creates `node_modules/` and `package-lock.json` (local to `fetch-scratch/`).
- `npm test` runs two tests. The first test (`returns ok:true when ...`) FAILS because the stub returns `{ ok: false }`. The second test (`returns ok:false when fetch throws`) PASSES.
- This is intended — the stub is incomplete on purpose so the starting state matches a "just before you write the body" drill.

If both tests somehow pass or the runner errors, stop and diagnose.

- [ ] **Step 9: Ensure fetch-scratch/node_modules stays out of git**

Run:
```bash
cd /home/jhedin/workspace/scratchpad
cat .gitignore
```

If `.gitignore` does not already cover nested `node_modules/` (root `.gitignore` as of this plan contains just `node_modules`), append the explicit entry:

```bash
cd /home/jhedin/workspace/scratchpad
# Only run if the current .gitignore does not match nested node_modules.
# grep -qxF 'node_modules' .gitignore || echo 'node_modules' >> .gitignore
```

Expected state after: `git status` from the repo root should NOT show `fetch-scratch/node_modules/` or `fetch-scratch/package-lock.json` in the untracked list. If `package-lock.json` appears and you want to commit it, do so in the next step; otherwise add to `.gitignore`.

- [ ] **Step 10: Commit the base workspace**

Run:
```bash
cd /home/jhedin/workspace/scratchpad
git add fetch-scratch/package.json \
        fetch-scratch/tsconfig.json \
        fetch-scratch/solution.ts \
        fetch-scratch/solution.test.ts \
        fetch-scratch/lib/fetch-json.ts \
        fetch-scratch/fixtures/example.json \
        fetch-scratch/fixtures/README.md \
        fetch-scratch/README.md
# Also add fetch-scratch/package-lock.json if you decided to commit it.
git commit -m "feat: add fetch-scratch workspace for integration drills

Sibling to the algorithmic workspace at repo root. Includes a fetch-json
helper, a mock-fetch test pattern, example fixture, and a README. Ancestor
commit for the drill-NN-*-part-K branches."
git push origin main
```

Expected: one commit on `main`, pushed to origin. This commit is the **base commit** (record its SHA — phase 2 branches from here).

### Task 1.2: Record the base commit SHA

**Files:** none — this is a lookup step used by Phase 2.

- [ ] **Step 1: Capture the base commit SHA**

Run:
```bash
cd /home/jhedin/workspace/scratchpad
git rev-parse main
```

Expected: a 40-character SHA. **Record it** — every drill branch in Phase 2 is created from this commit. Call this value `$BASE_SHA` in subsequent steps.

---

## Phase 2: Author drill branches in parallel worktrees

Goal: produce 17 drills × average 3 parts ≈ 49 branches on origin. Each drill is authored in its own worktree by one subagent so work can be dispatched in parallel.

### Shared conventions (applies to every drill authoring task)

Every drill-authoring task — Tasks 2.1 through 2.17 — follows the same shape:

1. Create a worktree rooted at `/home/jhedin/workspace/drill-authoring/drill-NN-<slug>/`, checked out to a new branch `drill-NN-<slug>-part-1` off `$BASE_SHA`.
2. In that worktree, **delete the `fetch-scratch/` folder** (drill branches are self-contained — they replace the workspace, they don't live beside it). Also delete the root `solution.ts` / `solution.test.ts` (drill branches should boot with just the drill files).
3. Write the drill's part-1 starter files at the worktree root: `README.md`, `package.json`, `tsconfig.json`, `solution.ts`, `solution.test.ts`, plus any `lib/` helpers or `fixtures/` input data the drill uses.
4. Commit and push `drill-NN-<slug>-part-1`.
5. For part 2: `git checkout -b drill-NN-<slug>-part-2`, apply the reference Part 1 solution, add the Part 2 extension (new README section, new tests, any expanded stub), commit, push.
6. Repeat for part 3 where applicable.

**Every drill's README.md must contain:**
- A 1–2 sentence scenario (the fake API the drill imitates).
- A `## Part 1` section describing the task.
- `## Part 2` and `## Part 3` sections (if applicable) containing **only** their own task descriptions — on a given part-K branch, only the Part K section is "active"; earlier parts are documented so the reader sees the progression.
- One **deliberately buried quirk** (a unit detail, off-by-one, time-zone convention, header semantics) that only a careful reader catches.
- A `## How to run` section with the commands.

**Every drill's package.json must include** `test` and `watch` scripts identical in shape to the fetch-scratch workspace, with extra libraries (`axios`, `node-fetch`) pinned only where the drill requires them.

**Every drill's solution.test.ts must**:
- Use `node:test` with `t.mock.method(globalThis, "fetch", ...)` except where the drill is explicitly about a different library.
- Include at least one happy-path test and one failure-path test on the starter branch.
- All starter tests must be **failing on purpose** on the part-K branch before the user writes their answer (except where noted per-drill) — so `npm test` immediately shows the user what to chase.

**Commit messages** use `feat(drill-NN-part-K): starter for <slug>` so the git log reads cleanly.

### Task 2.1: Drill 01 — Ping (3 parts)

**Subagent dispatch:**

Spawn a subagent with the prompt below. Use isolation `worktree` so the agent's checkout lives under `/home/jhedin/workspace/drill-authoring/drill-01-ping/` without disturbing main. The agent produces three pushed branches: `drill-01-ping-part-1`, `drill-01-ping-part-2`, `drill-01-ping-part-3`.

- [ ] **Step 1: Dispatch the authoring subagent**

Use the Agent tool with subagent_type `general-purpose` and the following prompt (verbatim):

```
You are authoring a three-part fetch drill in the scratchpad repo.

CONTEXT:
- Repo: /home/jhedin/workspace/scratchpad (remote: origin)
- Base commit SHA: $BASE_SHA  (the user will substitute)
- Design spec: /home/jhedin/workspace/scratchpad/docs/superpowers/specs/2026-04-22-fetch-drills-design.md
- Implementation plan: /home/jhedin/workspace/scratchpad/docs/superpowers/plans/2026-04-22-fetch-drills.md
  (read the "Shared conventions" section before starting)

DRILL SPEC — Drill 01 "Ping":
- Scenario: A status endpoint at GET /status returns `{ ok: boolean, version: string }`.
- Part 1: Write `isHealthy(baseUrl: string): Promise<boolean>` that calls GET
  `${baseUrl}/status`, returns `true` iff the JSON body has `ok === true`.
  On any network error or non-2xx response, return `false` (do not throw).
- Part 2: Add `getVersion(baseUrl: string): Promise<string | null>` that calls
  the same endpoint and returns the `version` string, or `null` on any failure.
  Share a private helper with isHealthy so fetch is only invoked from one place.
- Part 3: Accept an optional second argument `{ timeoutMs: number }` (default 2000).
  Use AbortSignal.timeout to cancel the request. On timeout, both functions behave
  like the network-failure case (return false / null).
- Buried quirk: the endpoint returns `{"ok": true}` but ALSO occasionally returns
  `{"ok": "true"}` (string, not boolean) from legacy servers. The drill README
  mentions this in passing in a "notes" line. isHealthy must treat the string
  form as false (strict boolean check).

STARTER FILES to write for part 1 at the worktree root:
- README.md (see Shared Conventions for required sections)
- package.json (same shape as fetch-scratch/package.json, name "drill-01-ping")
- tsconfig.json (same as fetch-scratch/tsconfig.json)
- solution.ts: exports async isHealthy with a stub body that always returns false
- solution.test.ts: one passing test for the "network throws → false" case using
  t.mock.method, one FAILING test for "endpoint returns {ok:true} → true"

TESTS must fail by default on part-1 (the happy path test) so the user sees
red on `npm test`.

PART 2 BRANCH:
- Start from part-1 with the reference part-1 solution applied.
- README.md gains a Part 2 section.
- solution.ts gains a `getVersion` stub that returns null.
- solution.test.ts gains tests for getVersion — one failing happy-path, one
  passing failure-path.

PART 3 BRANCH:
- Start from part-2 with the reference part-2 solution applied.
- README.md gains a Part 3 section describing the timeout option.
- solution.ts: both functions accept an options object; stub does NOT yet honor
  timeoutMs.
- solution.test.ts: add a test that uses a fetch stub which never resolves,
  asserts the function returns the failure value within a bounded time. Use
  t.mock.timers or a small setTimeout race if needed.

PROCESS:
1. git worktree add /home/jhedin/workspace/drill-authoring/drill-01-ping \
     -b drill-01-ping-part-1 $BASE_SHA
2. cd there. Delete fetch-scratch/ and root solution.ts/solution.test.ts from
   the checkout (they are ancestors of main but this drill is self-contained).
3. Write the Part 1 files. Run `npm install && npm test`. Confirm the intended
   tests fail.
4. Commit with message `feat(drill-01-ping-part-1): starter for ping`.
   Push with `git push -u origin drill-01-ping-part-1`.
5. git checkout -b drill-01-ping-part-2. Apply reference Part 1 solution.
   Write Part 2 additions. Test again. Commit + push.
6. git checkout -b drill-01-ping-part-3. Apply reference Part 2 solution.
   Write Part 3 additions. Test again. Commit + push.
7. Do NOT remove the worktree — the driver plan handles cleanup centrally.
8. Return a summary: list of branches pushed, SHAs of each commit.

KEEP CODE SMALL. The drill is for practicing — ~30-50 lines of code per part
is the target, plus tests.
```

- [ ] **Step 2: Review the returned summary**

Expected:
- Three branches pushed: `drill-01-ping-part-1`, `drill-01-ping-part-2`, `drill-01-ping-part-3`.
- Each branch's `README.md` and `solution.test.ts` exist and make sense.
- Run `git -C /home/jhedin/workspace/drill-authoring/drill-01-ping log --oneline` to skim the commits.

If the agent skipped a part or committed to the wrong branch, re-dispatch with corrections.

### Tasks 2.2 through 2.17: Additional drills

The remaining 16 drills follow the same dispatch pattern as Task 2.1. Each task below lists the drill's **scenario**, **part-by-part requirements**, and the **buried quirk**; the subagent prompt reuses the same template from Task 2.1's Step 1, substituting the drill-specific content.

Dispatch multiple drills in parallel — they are fully independent. A reasonable batch size is 4 drills per wave; review each batch's results before starting the next.

#### Task 2.2: Drill 02 — Auth'd GET (3 parts)

- Scenario: GET `/me` requires `Authorization: Bearer <token>`. Returns `{ id, email, plan }`.
- Part 1: `whoAmI(baseUrl, token): Promise<{id, email, plan}>`. Throw on any non-2xx. Throw a plain Error including the status code and body.
- Part 2: Accept `token` as either a raw string or `{ apiKey: string }` (some callers have a structured config). Normalize internally.
- Part 3: If the server returns 401, throw a distinguishable `AuthError` (a named class exported from the same file) rather than the generic Error.
- Buried quirk: the server echoes a `X-Request-Id` response header. The Part 3 test expects that header value to be attached to the thrown error's `.requestId` property. A naive error-throwing implementation drops it.

#### Task 2.3: Drill 03 — Filtered List (3 parts)

- Scenario: GET `/users?role=<r>&active=<bool>&limit=<n>` returns `{ users: [...] }`.
- Part 1: `listUsers(baseUrl, token, filters)`. Build the URL with `URLSearchParams`. Return the users array.
- Part 2: `filters` may include an optional `createdAfter: Date`. Send it as an ISO-8601 string in the `created_after` query parameter (note: snake_case in the wire format, camelCase in the TS interface).
- Part 3: Any filter whose value is `undefined` must be omitted from the URL, not sent as `?role=undefined`. Test the rendered URL string.
- Buried quirk: `active` is a boolean in the TS interface but the API expects the literal strings `"yes"` / `"no"` — NOT `"true"` / `"false"`. The README's example curl reveals this.

#### Task 2.4: Drill 04 — Error Bodies (3 parts)

- Scenario: POST `/charges` returns `{ id, amount }` on success; on 4xx returns `{ error: { type, code, message, param? } }`.
- Part 1: `createCharge(baseUrl, token, body)`. On non-2xx, parse the error body and throw an Error whose `.message` is `${type}/${code}: ${message}`.
- Part 2: Export a typed error class `ApiError extends Error` with fields `type`, `code`, `message`, `param`, `status`. Throw it instead of plain Error.
- Part 3: Distinguish `card_error` (4xx, do NOT retry) from `api_error` (5xx, retryable) on the thrown ApiError. Add a `.retryable: boolean` field. Do not actually implement the retry here — Drill 07 is for that. This drill only classifies.
- Buried quirk: some 4xx responses omit the `error` envelope entirely (just `{"type":"...","message":"..."}` flat). The implementation must handle both shapes.

#### Task 2.5: Drill 05 — Cursor Pagination (3 parts)

- Scenario: GET `/events?limit=N&starting_after=<id>` returns `{ data: [...], has_more: boolean }`.
- Part 1: `listEvents(baseUrl, token)` returns all events across pages. Use `has_more` to decide when to stop; pass the last event's `id` as `starting_after`.
- Part 2: Accept a `pageSize` option (default 100, max 1000). Validate max; throw RangeError if out of bounds.
- Part 3: Convert to `async function* iterateEvents(...)` — yields events one at a time. The collect-to-array version in Part 1 is rewritten to consume the iterator. Test that you can break out of the loop after seeing the first event without fetching subsequent pages.
- Buried quirk: the API returns `starting_after` as `last_id` in a top-level field — `has_more: true` without a `last_id` means "use the last element of `data`." Test both shapes.

#### Task 2.6: Drill 06 — Link-Header Pagination (3 parts)

- Scenario: GET `/repos/:owner/repos` returns JSON array + `Link: <url>; rel="next", <url>; rel="last"` header.
- Part 1: `listRepos(baseUrl, owner)` parses the Link header and follows `rel="next"` until absent.
- Part 2: Handle the degenerate case where there's no Link header at all (single-page response) — return the one page's results.
- Part 3: Yield results as they arrive via async generator. Add an optional `maxPages` safety cap.
- Buried quirk: Link header URLs may be absolute OR relative. Handle both. Test with a relative next-URL like `</repos?page=2>` and absolute `<https://example.test/repos?page=2>`.

#### Task 2.7: Drill 07 — Retry on 5xx (3 parts)

- Scenario: GET `/expensive-op` — usually succeeds (200) but sometimes returns 502/503/504 transiently.
- Part 1: `callWithRetry(url, opts)`. On 5xx, retry up to 3 times with exponential backoff (100ms, 200ms, 400ms). On 4xx, do NOT retry — throw immediately. Use `setTimeout` wrapped as a promise, NOT a busy-wait.
- Part 2: Add jitter — each backoff interval is randomized to ±25%. Use `t.mock.timers` or inject a `sleep` function so tests run fast.
- Part 3: Expose a `shouldRetry(response): boolean` hook so callers can customize (e.g. treat 429 as retryable — Drill 08 extends this). Default behavior unchanged.
- Buried quirk: if the FIRST call succeeds on attempt N, the total delay is `sum(backoffs)` — not the last backoff alone. A test measures this by accumulating mock-timer advances and asserts total elapsed time.

#### Task 2.8: Drill 08 — 429 + Retry-After (3 parts)

- Scenario: same as Drill 07 but now also returns 429 with a `Retry-After: <seconds>` header.
- Part 1: Extend the retry helper from Drill 07 (copy it in, don't import across drills) to honor `Retry-After` on 429 — use that value instead of the exponential backoff.
- Part 2: `Retry-After` may be an HTTP-date instead of a number. Parse both forms. If parsing fails, fall back to exponential backoff.
- Part 3: Cap total wait at a configurable maximum (default 30 seconds). If the server tells us to wait longer than the cap, throw a `RateLimitError` instead of waiting.
- Buried quirk: on 429 WITHOUT a Retry-After header, fall back to the exponential backoff — do NOT refuse to retry. The README mentions this in a line about "server hints are optional."

#### Task 2.9: Drill 09 — Idempotency Keys (3 parts)

- Scenario: POST `/charges` with an `Idempotency-Key` header. If the same key is replayed, the server returns the original response.
- Part 1: `chargeOnce(body)` generates a UUID v4 idempotency key, sends the POST, returns the charge. Use `node:crypto` `randomUUID()`.
- Part 2: Wire this through the retry logic from Drill 07 (copy in). On retry, REUSE the same key — do NOT regenerate. A test verifies the same key appears in all retried requests.
- Part 3: Persist the key-to-response mapping in an in-memory LRU (max 1000 entries). `chargeOnce` first checks the cache; if the key is known, skip the network call and return the cached response. Include the charge body's hash in the cache key so a different body with the same UUID throws an `IdempotencyMismatchError`.
- Buried quirk: UUIDs must be generated ONCE per logical charge attempt, not once per HTTP attempt. A naïve "generate inside the fetch function" regenerates on every retry. Test that retrying twice uses the same key.

#### Task 2.10: Drill 10 — HMAC Webhook Verify (3 parts)

- Scenario: Incoming webhook POST body + `X-Signature: t=<timestamp>,v1=<hex>` header. Secret shared out of band.
- Part 1: `verifyWebhook(rawBody: string, header: string, secret: string): boolean`. Compute HMAC-SHA256 over `${timestamp}.${rawBody}` using `secret`. Compare to `v1` with `crypto.timingSafeEqual`.
- Part 2: Reject signatures older than 5 minutes by comparing `timestamp` (unix seconds) to `Date.now()`. Accept an optional `toleranceSeconds` option (default 300).
- Part 3: The header may list MULTIPLE `v1=` values (key rotation). Accept if ANY matches. Still reject on timestamp skew regardless of key match.
- Buried quirk: the header format uses `,` as separator, but whitespace around keys is legal (`v1= abc` should work). The README says "whitespace tolerant per the spec" — candidates often miss the `.trim()`.

#### Task 2.11: Drill 11 — Concurrency Cap (3 parts)

- Scenario: given 200 user IDs, fetch `/users/:id` for each, collect all results. API rate-limits on too many in-flight requests.
- Part 1: `fetchMany(ids, fetcher)` — accept a pool size of 5. Collect ALL results in input order. Use a worker-pool pattern (while queue nonempty, keep 5 workers busy). `Promise.all` is the WRONG answer.
- Part 2: Accept a `concurrency` option (default 5). Return an array preserving input order regardless of completion order.
- Part 3: `onError: 'fail-fast' | 'collect'` option. `fail-fast` aborts remaining work on first failure. `collect` returns an array of `{ok: true, value} | {ok: false, error}` objects, never throws.
- Buried quirk: with `fail-fast`, in-flight requests cannot be truly cancelled (fetch AbortController is unreliable across all cases). The README specifies the contract: "stop DISPATCHING new work on first error; let in-flight requests complete but discard their results."

#### Task 2.12: Drill 12 — Multipart Upload (3 parts)

- Scenario: POST `/upload` with a multipart body containing a JSON metadata part and a binary file part.
- Part 1: `upload(baseUrl, token, {metadata, fileBytes, filename})`. Use native `FormData` and `Blob`. Set Content-Type correctly (don't set it manually — let FormData set the boundary).
- Part 2: Accept `fileBytes` as either a `Uint8Array`, `Buffer`, or a Node `Readable` stream. Normalize internally.
- Part 3: Track upload progress via an optional `onProgress(bytesSent: number): void` callback. Since fetch doesn't expose upload progress directly, implement by wrapping the stream and counting bytes as they're pulled.
- Buried quirk: setting `Content-Type: multipart/form-data` manually (without the boundary) breaks the server parse. The README shows a tempting "set Content-Type" example in the curl snippet that, if copied into the fetch init, silently corrupts the request.

#### Task 2.13: Drill 13 — SSE Stream (3 parts)

- Scenario: GET `/events/stream` returns `text/event-stream`. Lines: `data: <json>\n\n`. Terminator: `data: [DONE]`.
- Part 1: `readAllEvents(baseUrl)` consumes the whole stream, returns an array of parsed JSON events.
- Part 2: The stream may chunk mid-event (the `\n\n` terminator may land across reads). Buffer partial lines across reads. A test uses a mock that delivers bytes in awkward splits.
- Part 3: Rewrite as `async function* iterEvents(baseUrl)`. Consumer can break early; the underlying stream must be cancelled (`reader.cancel()`).
- Buried quirk: SSE comments (lines starting with `:`) must be ignored, not parsed. A test includes keep-alive comments like `: ping\n\n` interleaved with real data.

#### Task 2.14: Drill 14 — Real-API Capstone (single part, heavier)

- Scenario: public GitHub API. `integration(username)` fetches `/users/:username/repos` (Link-header paginated), filters to repos with `stargazers_count >= 10`, writes a CSV of `full_name,stargazers_count,language` to `output/<username>.csv`.
- ONE part only. Heavier starter: ~80-120 lines across `solution.ts`, `lib/csv.ts`, and `lib/paginate.ts`. The latter two have stubs the user fills in.
- Tests: the primary test uses `t.mock.method` to stub fetch. A secondary test (in `solution.integration.test.ts`) is SKIPPED by default (`{ skip: process.env.RUN_REAL === undefined }`) and hits the real GitHub API when `RUN_REAL=1 npm test` is used.
- Buried quirk: GitHub's Link header with `rel="next"` is missing on the LAST page — same as Drill 06's degenerate case. Also rate-limits unauthenticated requests to 60/hour; the README notes this.

#### Task 2.15: Drill 15 — Axios Retry (3 parts, library variant)

- Functionally identical to Drill 07, but solution uses `axios` instead of `fetch`. `package.json` pins `axios: ^1.7.0`.
- Tests mock the axios adapter (`axios.defaults.adapter = ...`) instead of `globalThis.fetch`.
- The README explicitly notes: "this is Drill 07 rewritten — don't repeat your learning, focus on the library idiom differences."
- Buried quirk: axios throws on non-2xx by default (different from fetch). A naive port of the fetch version's `!res.ok` check never executes.

#### Task 2.16: Drill 16 — node-fetch Concurrency (3 parts, library variant)

- Functionally identical to Drill 11, but uses `node-fetch` (`import fetch from "node-fetch"`). `package.json` pins `node-fetch: ^3.3.2`.
- Tests mock the imported `fetch` symbol via `t.mock.module` (or equivalent), not `globalThis.fetch`.
- README notes this is Drill 11 rewritten.
- Buried quirk: `node-fetch`'s Response body is a Node stream, not a Web stream — mixing `response.body.getReader()` (Web API) with `node-fetch` fails. The README's "migration note" section calls this out.

#### Task 2.17: Drill 17 — Find the Seam (single part, unfamiliar repo)

- Scenario: given a pre-built 5-file project (a config module, a data-loader module, a service stub, a utility, and a README), implement one new endpoint call in the service file. The challenge is navigation, not algorithmic.
- Starter is heavier: ~100 lines spread across the files, with obvious "FILL ME IN" markers only at the one spot the user should touch. All tests reference imports that are already wired up.
- ONE part only.
- Buried quirk: one of the "utility" functions has a subtle bug unrelated to the user's task. The README includes a note "we know about this — don't fix it, it's covered by a PR." A candidate who gets distracted into fixing that bug wastes time.

### Task 2.18: Collect branch manifest

**Files:**
- Create: `scratchpad/docs/superpowers/plans/2026-04-22-fetch-drills-branches.txt` (or report inline — up to the executor).

- [ ] **Step 1: List all drill branches**

Run:
```bash
cd /home/jhedin/workspace/scratchpad
git branch -r | grep '^  origin/drill-' | sed 's|  origin/||'
```

Expected: 47 branches total — 13 three-part core drills (01-13) × 3 = 39, plus 1 single-part capstone (drill 14) = 40, plus 2 three-part library variants (15-16) × 3 = 6 → 46, plus 1 single-part unfamiliar-repo (drill 17) = 47. If some drills collapsed to 2 parts during authoring, the count can drop to ~43-47.

- [ ] **Step 2: Save the manifest**

Write the list to `docs/superpowers/plans/2026-04-22-fetch-drills-branches.txt` for Phase 3 to consume. Do not commit this file — it's a build artifact.

---

## Phase 3: Interviewer repo index

Goal: give the user a navigable entry point in `/home/jhedin/workspace/interviewer` that mirrors `drills.md`, but for fetch drills. Each drill's section includes its prompt, parts, and the branch name to check out.

### Task 3.1: Create the fetch-drills index

**Files:**
- Create: `interviewer/fetch-drills.md`

- [ ] **Step 1: Generate `fetch-drills.md`**

The file has this overall shape. Each drill's prompt content is extracted from the README.md on its own `drill-NN-*-part-1` branch (the part-1 README is the canonical prompt, since it includes all later parts as preview sections).

Write `/home/jhedin/workspace/interviewer/fetch-drills.md`:

```md
# Stripe-Style Fetch/Integration Drills

Seventeen drills mirroring Stripe's onsite Integration round. Each drill has a
**prompt** (read it, ask clarifying questions, then start coding) and a
**branch** in the `scratchpad` repo with pre-populated starter code. Use these
for timed practice (45–60 min per drill).

**How to use:**
1. Read the drill's prompt in this file.
2. `cd /home/jhedin/workspace/scratchpad && git checkout drill-NN-<slug>-part-1`.
3. `npm install && npm test` — see the failing tests.
4. Solve Part 1. When the tests pass, `git checkout drill-NN-<slug>-part-2` to
   reset to the Part 2 starter (which already contains a reference Part 1
   answer).
5. Repeat through the final part.

**About the "buried quirks":** every drill's README mentions one non-obvious
detail (a unit convention, edge case, or API quirk) that rewards careful reading.
If you skim, you'll miss it and a test will catch you. This is deliberate.

## Progress

- [ ] Drill 01: Ping
- [ ] Drill 02: Auth'd GET
- [ ] Drill 03: Filtered List
- [ ] Drill 04: Error Bodies
- [ ] Drill 05: Cursor Pagination
- [ ] Drill 06: Link-Header Pagination
- [ ] Drill 07: Retry on 5xx
- [ ] Drill 08: 429 + Retry-After
- [ ] Drill 09: Idempotency Keys
- [ ] Drill 10: HMAC Webhook Verify
- [ ] Drill 11: Concurrency Cap
- [ ] Drill 12: Multipart Upload
- [ ] Drill 13: SSE Stream
- [ ] Drill 14: Real-API Capstone
- [ ] Drill 15: Axios Retry (library variant)
- [ ] Drill 16: node-fetch Concurrency (library variant)
- [ ] Drill 17: Find the Seam (unfamiliar repo)

---

<!-- For each of the 17 drills, emit a section of this form: -->

## Drill NN: <Title>

**Branch:** `drill-NN-<slug>-part-1` (Part 1 starter)

<prompt content copied verbatim from the Part 1 README.md in the scratchpad
branch — including Part 1 / Part 2 / Part 3 subsections so the whole drill is
visible here>

---
```

Concrete generation: for each of the 17 drills, `git show drill-NN-<slug>-part-1:README.md` (run from scratchpad) dumps the canonical prompt. Paste each drill's contents under its `## Drill NN: <Title>` heading, stripping the drill's local `# Title` heading to avoid double-titling.

A helper script to dump all prompts:

```bash
cd /home/jhedin/workspace/scratchpad
for i in $(seq -f '%02g' 1 17); do
    branch=$(git branch -r | grep -o "origin/drill-${i}-[a-z0-9-]*-part-1" | head -1)
    [ -z "$branch" ] && branch=$(git branch -r | grep -o "origin/drill-${i}-[a-z0-9-]*$" | head -1)
    echo "=== $branch ==="
    git show "${branch#origin/}:README.md"
    echo
done
```

Pipe the output into your editor and format it into the index.

- [ ] **Step 2: Review for accuracy**

For each drill, verify:
- The branch name in the index matches an actual branch in scratchpad's `git branch -r`.
- The prompt content reads naturally — no missing sections, no leftover authoring TODOs.
- The progress checkbox list at the top matches the 17 drills.

- [ ] **Step 3: Commit to interviewer repo**

Run:
```bash
cd /home/jhedin/workspace/interviewer
git add fetch-drills.md
git commit -m "docs: add Stripe-style fetch/integration drill prompts

Seventeen multi-part drills for practicing the onsite Integration round.
Each drill's starter code lives on a drill-NN-*-part-K branch in the
scratchpad repo; this file is the prompt index."
git push origin main
```

Expected: one commit on `interviewer:main`, pushed.

### Task 3.2: Cross-link from interviewer README

**Files:**
- Modify: `interviewer/README.md`

- [ ] **Step 1: Add a one-line link to fetch-drills.md**

Read `interviewer/README.md`. If it already has a section listing drill files, add a line for `fetch-drills.md` alongside `drills.md`. If it does not, add a brief "Drill Sets" section near the top with two bullets.

Example addition (adapt to existing tone):
```md
## Drill Sets

- [Algorithmic drills](drills.md) — 11 multi-part Stripe-style algorithmic problems.
- [Fetch / integration drills](fetch-drills.md) — 17 multi-part drills covering
  fetch, auth, pagination, retry, idempotency, streaming, and unfamiliar-repo
  navigation.
```

- [ ] **Step 2: Commit**

```bash
cd /home/jhedin/workspace/interviewer
git add README.md
git commit -m "docs: link fetch-drills.md from README"
git push origin main
```

---

## Phase 4: Cleanup

Goal: remove the authoring worktrees. Branches remain on origin and locally — they ARE the product.

### Task 4.1: Remove authoring worktrees

**Files:** none — git-tree-state only.

- [ ] **Step 1: List authoring worktrees**

Run:
```bash
cd /home/jhedin/workspace/scratchpad
git worktree list
```

Expected: main worktree at `/home/jhedin/workspace/scratchpad` plus 17 authoring worktrees under `/home/jhedin/workspace/drill-authoring/`.

- [ ] **Step 2: Remove each authoring worktree**

Run:
```bash
cd /home/jhedin/workspace/scratchpad
for dir in /home/jhedin/workspace/drill-authoring/*/; do
    git worktree remove "$dir"
done
```

Expected: each removal succeeds. If any fails with "working tree has modifications," inspect the worktree — there should be no uncommitted work at this point; if there is, surface to the user before forcing.

- [ ] **Step 3: Remove the authoring parent directory**

Run:
```bash
rmdir /home/jhedin/workspace/drill-authoring
```

Expected: succeeds only if empty. If files remain (e.g. stray `node_modules/`), list them for the user before removing.

- [ ] **Step 4: Prune worktree metadata**

Run:
```bash
cd /home/jhedin/workspace/scratchpad
git worktree prune
git worktree list
```

Expected: only the main worktree remains.

### Task 4.2: Verify deliverables

**Files:** none — final check.

- [ ] **Step 1: Confirm all drill branches are present on origin**

Run:
```bash
cd /home/jhedin/workspace/scratchpad
git ls-remote --heads origin 'drill-*' | wc -l
```

Expected: around 47 branches (see Task 2.18 for the breakdown).

- [ ] **Step 2: Confirm `main` still builds**

Run:
```bash
cd /home/jhedin/workspace/scratchpad
npm test
cd fetch-scratch
npm install
npm test
```

Expected: root algorithmic test runner behaves as before. `fetch-scratch` tests run (one failing by design from Phase 1, one passing).

- [ ] **Step 3: Smoke-test one drill end-to-end**

Run:
```bash
cd /home/jhedin/workspace/scratchpad
git checkout drill-01-ping-part-1
npm install
npm test
```

Expected: failing tests that match the drill's intended starting point. Then:

```bash
git checkout main
```

Expected: return to main cleanly, `fetch-scratch/` reappears intact.

- [ ] **Step 4: Confirm interviewer repo changes**

Run:
```bash
cd /home/jhedin/workspace/interviewer
git log --oneline -5
cat fetch-drills.md | head -30
```

Expected: recent commits adding `fetch-drills.md` and README link. The index file reads cleanly.

- [ ] **Step 5: Declare done**

Report to the user:
- Number of branches authored.
- Path to `fetch-drills.md`.
- Sample command to start the first drill: `cd scratchpad && git checkout drill-01-ping-part-1 && npm install && npm test`.
