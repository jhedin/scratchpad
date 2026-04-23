# Drill 09: Idempotency Keys

Generate idempotency keys, send them correctly, and reuse them on retries. No more double-charging.

**Scenario:** `POST /charges` with an `Idempotency-Key` header. The server returns the original response if the same key replays.

## Part 1

Implement `chargeOnce(baseUrl, token, body): Promise<{id, amount}>`. Generate a UUID v4 (`node:crypto.randomUUID()`) and send as `Idempotency-Key` header. POST with `Content-Type: application/json`. Return parsed JSON on 2xx; throw on non-2xx.

## Part 2

Wire in retry. On 5xx, retry up to 3 times with exponential backoff (100/200/400ms). **Reuse the SAME idempotency key across all retries.** The whole point of the idempotency key is that retries use the same key — if you generate it inside the retry loop, you just created N independent charges.

Accept `options.sleep` for test-time injection.

## Part 3

Add an in-memory LRU cache of idempotency-key → response. Export `IdempotencyStore`. Before the HTTP call, check the cache and return cached response if key is known. Cache size capped at 1000 (LRU eviction). If the same key is used with a DIFFERENT body, throw `IdempotencyMismatchError`.

Default: module-scoped singleton store. `chargeOnce` accepts `options.store` to inject a different one.

## How to run

```
npm install
npm test
```
