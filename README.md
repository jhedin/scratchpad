# Drill 01: Ping

Health-check client for a fake "Status" service. Good warm-up for fetch + JSON parsing + error swallowing.

**Scenario:** `GET /status` returns `{"ok": true, "version": "1.2.3"}` on healthy servers.

## Part 1

Implement `isHealthy(baseUrl: string): Promise<boolean>`. It calls `GET ${baseUrl}/status`, parses the JSON, and returns `true` iff `ok === true`. Any error (network, non-2xx, bad JSON) returns `false` — do not throw.

Notes: some legacy servers respond with `{"ok": "true"}` (string instead of boolean). Treat the string form as unhealthy.

## Part 2

Add `getVersion(baseUrl: string): Promise<string | null>` that returns the `version` field or `null` on any failure. Share code with `isHealthy` so `fetch` is only called from one place.

## Part 3

Both functions accept an optional second argument `{ timeoutMs?: number }` (default 2000). Use `AbortSignal.timeout` to cancel. On timeout, behave like any other failure.

## How to run

```
npm install
npm test
npm run watch    # rerun on file change
```
