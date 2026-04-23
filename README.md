# Drill 16: node-fetch + Concurrency Cap (library variant)

Same worker-pool problem as Drill 11, but using `node-fetch` as the underlying HTTP client.

> node-fetch's Response body is a Node stream, not a Web stream — use `.json()` / `.text()` methods, not `.body.getReader()`.

**Scenario:** fetch many URLs, cap in-flight, collect in input order.

## Part 1

`fetchMany<T>(urls, fetcher, concurrency = 5)`. Pool pattern; at most `concurrency` in flight; results in INPUT order; throw on first fetcher error.

## Part 2

Export `defaultFetcher(url): Promise<unknown>` using node-fetch. GET, parse JSON, throw on non-2xx. `fetchMany` uses it when no fetcher is provided.

## Part 3

Refactor signature to `fetchMany(urls, options)`. Options: `fetcher?, concurrency?, onError?`. `onError: 'collect'` returns `Array<{ok, value} | {ok, error}>`.

## How to run

```
npm install
npm test
```
