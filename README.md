# Drill 11: Concurrency Cap

Fan out N requests with at most K in flight at a time. Collect results in input order.

**Scenario:** fetch 200 users from an API; the server tolerates ~5 concurrent requests but not 200.

## Part 1

Implement `fetchMany<T, R>(items, fetcher, concurrency = 5): Promise<R[]>`. Workers pull from a shared queue; at most `concurrency` are in flight. Results returned in INPUT order regardless of completion order. If any fetcher throws, reject the whole thing. (Do not use `Promise.all` directly — that's unbounded parallelism.)

## Part 2

Accept `options: { concurrency?: number }` (default 5) as the 3rd argument. Same semantics.

## Part 3

Add `options.onError`:
- `'fail-fast'` (default): throw on first error; stop dispatching new work; let in-flight fetchers complete but discard results.
- `'collect'`: never throws; returns `Array<{ok: true, value} | {ok: false, error}>`.

Use function overloads so the return type depends on `onError`.

## How to run

```
npm install
npm test
```
