// Drill TS4: Template literal types.
//
// Part 1 — route paths.
type Resource = "users" | "posts" | "comments";
export type Route = `/${Resource}${"" | `${"/"}${string}`}`

// Part 2 — event names.
type Entity = "charge" | "customer";
type Action = "created" | "updated" | "deleted";
export type EventName = `${Entity}.${Action}`

// Part 3 — uppercase.
export type ScreamingEvent = /* fill in: "CHARGE.CREATED" | ... */ never;

// Verify
const r1: Route = "/users";
const r2: Route = "/users/abc123";
// const r3: Route = "/orders"; // should fail

const e1: EventName = "charge.created";
// const e2: EventName = "charge.paid"; // should fail

const s1: ScreamingEvent = "CHARGE.CREATED";
