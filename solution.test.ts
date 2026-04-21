import assert from "node:assert/strict";
import { describe, it } from "node:test";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.throws(() => fn())    — expects an error
import { solution } from "./solution.ts";

describe("solution", () => {
    it("finds two numbers that add up to target", () => {
        const accounts = [
            { id: "a", balance: 150 },
            { id: "b", balance: 80 },
            { id: "c", balance: 200 },
            { id: "d", balance: 60 },
        ];
        const threshold = 100;

        const props = { accounts, threshold }

        const expected = [
            { from: "a", to: "b", amount: 20 },
            { from: "c", to: "d", amount: 40 },
        ]

        let transfers = solution(props)
        let accountsCopy = JSON.parse(JSON.stringify(accounts)) as typeof accounts

        for (let transfer of transfers) {
            let accountFrom = accountsCopy.find(account => account.id == transfer.from)
            let accountTo = accountsCopy.find(account => account.id == transfer.to)
            if (accountFrom && accountTo) {
                accountFrom.balance -= transfer.amount
                accountTo.balance += transfer.amount
            }
        }
        assert.ok(accountsCopy.every(account => account.balance >= threshold))
    });


});
