import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { describe as describeResult, type Result } from "./solution.ts";

describe("Result discriminated union", () => {
    it("describes loading", () => {
        const r: Result<number> = { status: "loading" };
        assert.strictEqual(describeResult(r), "loading...");
    });

    it("describes success", () => {
        const r: Result<number> = { status: "success", data: 42 };
        assert.strictEqual(describeResult(r), "got: 42");
    });

    it("describes error", () => {
        const r: Result<number> = { status: "error", error: new Error("oops") };
        assert.match(describeResult(r), /error: oops/);
    });

    it("describes success with object data via JSON", () => {
        const r: Result<{ id: string }> = { status: "success", data: { id: "x" } };
        assert.strictEqual(describeResult(r), `got: {"id":"x"}`);
    });
});
