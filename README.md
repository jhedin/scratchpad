# Drill 07: Retry on 5xx

Retry transient server errors with exponential backoff. Don't retry client errors.

**Scenario:** `GET /expensive-op` returns 200 `{result: number}` on success, 502/503/504 transiently. 4xx responses are permanent — don't retry.

## Part 1

Implement `callWithRetry<T>(url, init?): Promise<T>`. On 5xx, retry up to 3 times (4 total attempts) with exponential backoff: 100ms, 200ms, 400ms. On 4xx, throw immediately. On 2xx, return parsed JSON.

Total wait before attempt K is the sum of all prior backoff intervals, not just the K-1th.

## Part 2

Add jitter: each backoff is randomized ±25% (e.g. 100ms becomes 75-125ms). Also allow injecting `sleep` via options for testability.

## Part 3

Expose a `shouldRetry(response)` hook via options. Default: retry on status >= 500. Callers can override (e.g. to also retry on 429 — see Drill 08).

## How to run

```
npm install
npm test
```
