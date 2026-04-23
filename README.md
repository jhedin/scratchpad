# Drill 15: Axios Retry (library variant)

Same retry problem as Drill 07, but with `axios` instead of `fetch`. The purpose is to get comfortable with axios's idioms.

> axios throws on non-2xx by default. Your retry logic must catch the error, inspect `err.response?.status`, and decide whether to retry or rethrow.

**Scenario:** `GET /expensive-op` usually returns 200 `{result: number}`. Sometimes 502/503/504 transiently. 4xx is permanent.

## Part 1

Implement `callWithRetry<T>(url, config?): Promise<T>`. Use axios. On 5xx, retry up to 3 times (100/200/400ms). On 4xx, throw immediately. Return `response.data`.

## Part 2

Add ±25% jitter to each backoff. Accept `options.sleep` for test injection.

## Part 3

Expose `options.shouldRetry(err: AxiosError): boolean`. Default: `err.response?.status ?? 0 >= 500`.

## How to run

```
npm install
npm test
```
