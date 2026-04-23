# fetch-scratch

From-scratch workspace for fetch-style integration drills. Separate from the
root `solution.ts` so you never mix algorithmic-drill work with HTTP-drill work.

## Run
```
cd fetch-scratch
npm install            # once
npm test
npm run watch          # rerun on change
```

## What's here
- `solution.ts` — your active work
- `solution.test.ts` — has the `t.mock.method(globalThis, "fetch", ...)` pattern
- `lib/fetch-json.ts` — small helper; feel free to ignore or expand
- `fixtures/` — example input data

## Reset
`npm run reset` at the repo root only touches root `solution.ts` /
`solution.test.ts`. To reset this folder, use git: stash or check out a clean
version of `fetch-scratch/`.
