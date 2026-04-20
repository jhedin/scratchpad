import assert from "node:assert/strict";
import { describe, it } from "node:test";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.throws(() => fn())    — expects an error
import { solution } from "./solution.ts";

describe("solution", () => {
    it("gets ruleIds", () => {

        const rules = [
            { rule_id: "r1", flagged_transactions: ["t1", "t2", "t3"] },
            { rule_id: "r2", flagged_transactions: ["t2", "t4"] },
            { rule_id: "r3", flagged_transactions: ["t5"] },
        ];
        const targetTransactionId = "t2";

        const props = { rules, targetTransactionId };
        const expected = { ruleIds: ["r1", "r2"] };
        assert.deepStrictEqual(solution(props), expected);
    });

});
