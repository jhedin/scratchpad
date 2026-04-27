import assert from "node:assert/strict";
import { describe, it } from "node:test";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.throws(() => fn())    — expects an error
import { solution } from "./solution.ts";

type Status = "success" | "failure"
interface ChargeResponse {
    status: Status,
    amount: number
}

describe("solution", () => {

    const mockCharge: (amount: number) => ChargeResponse = (amount: number) => { return { status: "success", amount: amount } }

    it("provided", () => {

        let processRequest = solution({ chargeCard: mockCharge }).processRequest

        assert.deepStrictEqual(processRequest({ key: "key_1", amount: 100 }), { status: "success", amount: 100 })
        assert.deepStrictEqual(processRequest({ key: "key_1", amount: 100 }), { status: "success", amount: 100 })
        assert.deepStrictEqual(processRequest({ key: "key_2", amount: 50 }), { status: "success", amount: 50 })
        assert.throws(() => processRequest({ key: "key_1", amount: 200 }))   // Part 2: throws IdempotencyMismatchError
        assert.deepStrictEqual(processRequest({ key: "key_3", amount: 75, timestamp: 0 }), { status: "success", amount: 75 })        // Part 3: pass timestamp
        assert.deepStrictEqual(processRequest({ key: "key_3", amount: 75, timestamp: 86399 }), { status: "success", amount: 75 })    // still cached
        assert.deepStrictEqual(processRequest({ key: "key_3", amount: 80, timestamp: 86401 }), { status: "success", amount: 80 })    // expired, runs again
    });

});
