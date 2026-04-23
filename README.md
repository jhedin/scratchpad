# Drill 05: Cursor Pagination

Paginate through a listing endpoint until done. Return all results.

**Scenario:** `GET /events?limit=N&starting_after=<id>` returns `{data, has_more, last_id?}`. Pass the previous page's last ID as `starting_after` to get the next page. Stop when `has_more: false`.

## Part 1

Implement `listEvents(baseUrl, token): Promise<Event[]>`. Fetch ALL pages. Default page size 100. Use `URLSearchParams`. Send bearer auth.

The server usually returns the next cursor as `last_id`, but if it's missing on a `has_more: true` response, use the last event's own id.

## Part 2

Accept `options?: { pageSize?: number }`. Default 100, max 1000, min 1. Throw `RangeError` on out-of-bounds.

## Part 3

Add `iterateEvents(baseUrl, token, options?)` as an async generator that yields events one at a time. Rewrite `listEvents` to consume it. A consumer that breaks early should not trigger fetches beyond the current page.

## How to run

```
npm install
npm test
```
