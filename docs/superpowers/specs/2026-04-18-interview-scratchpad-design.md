# Interview Scratchpad — Design

## Overview

A zero-friction Node.js TypeScript workspace for solving interview questions live. Single solution/test file pair, overwritten each session.

## Stack

- **Runtime**: Node 22+ with `--experimental-strip-types` (native TS, no transpile step)
- **Test runner**: `node --test` (built-in)
- **Type checking**: `tsc --noEmit` (one dev dependency: `typescript`)
- **VS Code sidebar**: Node.js Test Runner extension (experimental)

## Structure

```
scratchpad/
├── solution.ts          # solution code
├── solution.test.ts     # tests using node:test
├── package.json         # scripts: test, watch, types
└── tsconfig.json        # for editor IntelliSense only
```

## Scripts

| Command | Purpose |
|---|---|
| `npm test` | Run tests once |
| `npm run watch` | Run tests in watch mode |
| `npm run types` | Type-check without emitting |

## Key Decisions

- No dependencies except `typescript` (for `tsc`)
- Single file pair — overwrite each interview, no per-problem folders
- `tsconfig.json` is editor-only; Node strips types natively at runtime
- GitHub repo for version control

## Shell Command

`scratch <name>` added to `~/.zshrc` — clones the GitHub scratchpad repo into `~/workspace/<name>` and opens it in VS Code.

## Out of Scope

- Per-problem history/archiving
- Multiple language support
- Test framework beyond node:test
