# Drill 04: Error Bodies

Parse structured error responses and throw errors that carry the server's context.

**Scenario:** `POST /charges` with bearer auth + JSON body. Success = 200 `{id, amount}`. Errors = non-2xx with body shape `{error: {type, code, message, param?}}`.

## Part 1

Implement `createCharge(baseUrl, token, body)`. POST with `Content-Type: application/json`. On success return `{id, amount}`. On non-2xx, parse the error envelope and throw `new Error(\`${type}/${code}: ${message}\`)`.

Note: some servers return the error envelope flat without the outer `error` wrapper — handle both.

## Part 2

Export a class `ApiError extends Error` with `type`, `code`, `message`, `param` (nullable), and `status` fields. Throw it instead of plain Error.

## Part 3

Classify errors: `type === "api_error"` → retryable; `type === "card_error"` → not retryable; unknown types → not retryable. Attach as `.retryable: boolean` on the thrown ApiError. Do NOT actually retry here.

## How to run

```
npm install
npm test
```
