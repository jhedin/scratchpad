# Drill 08: 429 + Retry-After

Rate-limited retries. Honor the server's `Retry-After` header; fall back to exponential backoff.

**Scenario:** `GET /something` may return 2xx (success), 5xx (transient server error), 429 (rate-limited, possibly with `Retry-After` header), or 4xx (permanent failure).

## Part 1

Implement `callWithRetry<T>(url, init?, options?)`:
- 2xx → return JSON
- 5xx → retry with backoff 100/200/400ms + ±25% jitter (up to 3 retries)
- 429 with `Retry-After: <seconds>` → sleep that long (seconds, in the header, converted to ms)
- 429 without `Retry-After` → fall back to the exponential backoff schedule. Retry-After is a server hint. If absent on a 429, still retry using the exponential schedule.
- 4xx (other than 429) → throw immediately

`options.sleep` is injectable for testing.

## Part 2

`Retry-After` may also be an HTTP-date: `Wed, 21 Oct 2026 07:28:00 GMT`. Parse both forms. If parsing fails, fall back to the exponential backoff.

## Part 3

Add `options.maxTotalWaitMs` (default 30000). If the server tells us to wait longer than the remaining budget, throw `RateLimitError` with `retryAfterMs` set to what the server asked for.

## How to run

```
npm install
npm test
```
