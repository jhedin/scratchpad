# Drill 14: Real-API Capstone

Fetch a GitHub user's repos, filter by star count, write a CSV. Combines pagination, filtering, file I/O.

**Scenario:** Call `GET https://api.github.com/users/<username>/repos` (unauthenticated). Follow `Link: rel="next"` pagination. Keep repos with `stargazers_count >= 10`. Write to `<outputDir>/<username>.csv` with columns `full_name,stargazers_count,language`.

> **Heads up:** GitHub rate-limits unauthenticated requests to 60/hour per IP. The mocked tests in `solution.test.ts` don't hit the network. The `solution.integration.test.ts` does — it's skipped by default; set `RUN_REAL=1 npm run integration` to opt in.

## Deliverable

Implement `integration(username: string, outputDir?: string): Promise<string>` in `solution.ts` that returns the path to the written file.

## File layout

- `solution.ts` — main entry
- `lib/paginate.ts` — async generator, stub for you to fill in
- `lib/csv.ts` — CSV writer stub
- `solution.test.ts` — mocked tests (run with `npm test`)
- `solution.integration.test.ts` — real-network tests, skipped unless `RUN_REAL=1`

## How to run

```
npm install
npm test                       # mocked
RUN_REAL=1 npm run integration # real GitHub (up to ~60/hr unauth)
```
