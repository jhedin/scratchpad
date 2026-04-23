# Fixtures

Input data for from-scratch fetch drills. Read these via `node:fs/promises`
`readFile(new URL("./fixtures/example.json", import.meta.url), "utf8")` and
`JSON.parse` — same idiom the real interview repos use.

Amounts are in cents (matches Stripe convention). Watch for off-by-one unit
conversions when tests compare against dollars.
