# Drill 13: SSE Stream

Parse a `text/event-stream` response. Yield or collect the JSON-payload events.

**Scenario:** `GET /events/stream` returns streaming text:
```
data: {"type":"ping","n":1}

data: {"type":"done"}

data: [DONE]

```

- Events are separated by `\n\n`.
- Each event has one or more lines. The `data:` line carries JSON (or the `[DONE]` sentinel).
- Lines starting with `:` are SSE comments (keep-alives). Skip them.
- Stop at `[DONE]`.

## Part 1

Implement `readAllEvents(baseUrl): Promise<Event[]>`. Consume the stream with `response.body.getReader()` + `TextDecoder`. Parse each `data:` line (after trimming the `data: ` prefix) as JSON. Stop at `[DONE]`. Return the array.

## Part 2

The server may deliver events in chunks that split mid-event. Buffer partial content across reads before splitting on `\n\n`.

## Part 3

Rewrite as `iterEvents(baseUrl): AsyncGenerator<Event>`. When the consumer breaks the for-await-of loop, the underlying stream reader must be cancelled.

## How to run

```
npm install
npm test
```
