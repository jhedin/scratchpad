# Drill 10: HMAC Webhook Verify

Authenticate inbound webhook requests by verifying an HMAC signature. No fetch in this drill — pure crypto + header parsing.

**Scenario:** Server sends `POST` with JSON body + `X-Signature: t=<unix-seconds>,v1=<hex-sha256>` header. Secret shared out of band.

## Part 1

Implement `verifyWebhook(rawBody, header, secret): boolean`. Parse `t` and `v1`. Compute `HMAC-SHA256(secret, \`${t}.${rawBody}\`)`. Compare to `v1` with `crypto.timingSafeEqual`. Return false on malformed header.

The header is comma-separated `key=value` pairs, whitespace tolerant.

## Part 2

Add `options: { toleranceSeconds?: number; now?: () => number }`. Default tolerance 300 seconds. Reject if `|now - t| > toleranceSeconds`. `now` returns unix seconds (for deterministic tests).

## Part 3

Header may have multiple `v1=` values (key rotation): `t=123,v1=abc,v1=def`. Accept if ANY matches. Still enforce timestamp tolerance.

## How to run

```
npm install
npm test
```
