# Drill 17: Find the Seam

Navigate an unfamiliar 5-file project. Add a single API call in the right place.

**Scenario:** This is a payment-ingestion service. It already handles charges. You need to add refund support by implementing `createRefund()` in `src/services/refund-service.ts`.

## Setup

```
npm install
npm test
```

## What to do

Open `src/services/refund-service.ts`. There's ONE function with a `// TODO` marker. Implement it using the existing patterns from `charge-service.ts`.

## File tour (briefly)

- `src/config.ts` — env-var config (no change needed)
- `src/http.ts` — low-level fetch wrapper with bearer auth + error handling (no change needed)
- `src/types.ts` — shared types (no change needed)
- `src/services/charge-service.ts` — fully working; shows the pattern to follow
- `src/services/refund-service.ts` — **YOUR JOB** is the one TODO here
- `src/util/sleep.ts` — small utility (see note below)

## NOTE

We know about a bug in `util/sleep.ts` — don't fix it in this drill, it's being addressed in another PR. Focus on the refund endpoint.

## How to test

```
npm test
```

Tests exercise `createRefund`. They'll stay red until the TODO is filled in.
