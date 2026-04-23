# Drill 03: Filtered List

Build URLs properly with `URLSearchParams` and send auth headers. Return filtered results.

**Scenario:** `GET /users?role=<r>&active=<bool>&limit=<n>` with bearer auth returns `{ users: [...] }`.

Example curl:
```
curl -H 'Authorization: Bearer sk_test_xxx' \
  'https://api.example.test/users?role=admin&active=yes&limit=50'
```

## Part 1

Implement `listUsers(baseUrl, token, filters)`. Build the URL with `URLSearchParams`. Return the users array. Send the bearer header.

`filters` shape: `{ role?: string; active?: boolean; limit?: number }`.

## Part 2

`filters` additionally accepts `createdAfter?: Date`. Send it as an ISO-8601 string under the wire name `created_after`.

## Part 3

Any filter whose value is `undefined` must be omitted from the URL entirely — do not emit `?role=undefined` or `?role=`.

## How to run

```
npm install
npm test
```
