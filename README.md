# Drill 02: Auth'd GET

Call an authenticated endpoint with a bearer token. Error messages carry status + body for debugging.

**Scenario:** `GET /me` with `Authorization: Bearer <token>`. On success returns `{id, email, plan}`. Non-2xx throws.

## Part 1

Implement `whoAmI(baseUrl: string, token: string): Promise<{id: string; email: string; plan: string}>`. Send the bearer header. On non-2xx, throw `new Error(\`HTTP \${status}: \${body}\`)` where body is truncated to 200 chars.

## Part 2

`token` can be a string OR `{ apiKey: string }`. Normalize internally.

## Part 3

On 401, throw an exported `AuthError` (extends Error) instead of plain Error. The server returns `X-Request-Id` on every response; errors should surface it for debugging — attach it to the AuthError's `.requestId` field.

## How to run

```
npm install
npm test
```
