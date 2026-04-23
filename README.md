# Drill 06: Link-Header Pagination

Parse the `Link` response header to follow multi-page results, GitHub style.

**Scenario:** `GET /users/{owner}/repos` returns a JSON array of repos plus a Link header like:
```
Link: <https://api.example.test/repos?page=2>; rel="next", <https://api.example.test/repos?page=5>; rel="last"
```

The `Link` URLs may be absolute or relative to the base URL — handle both. On the last page there's no `rel="next"` (and possibly no Link header at all).

## Part 1

Implement `listRepos(baseUrl, owner): Promise<Repo[]>`. Parse the Link header, follow `rel="next"` until absent, concatenate all pages.

## Part 2

Handle the single-page case where no Link header is present — just return the page's results.

## Part 3

Add `iterateRepos(baseUrl, owner, options?)` as an async generator yielding one repo at a time. `options.maxPages` (optional) caps total pages fetched — if reached, throw `TooManyPagesError`.

## How to run

```
npm install
npm test
```
