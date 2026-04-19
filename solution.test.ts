import assert from "node:assert/strict";
import { describe, it } from "node:test";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.throws(() => fn())    — expects an error
import { solution } from "./solution.ts";

describe("solution", () => {
  it("routes known currencies to the cheapest processor", () => {

    const payments = [
      { id: "p1", amount: 100, currency: "USD" },
      { id: "p2", amount: 200, currency: "EUR" },
      { id: "p3", amount: 50, currency: "USD" },
      { id: "p4", amount: 80, currency: "USD" },
    ];

    const processors = [
      { name: "Alpha", supported_currencies: ["USD", "EUR"], fee_percent: 2.0, volume_limit_usd: 300 },
      { name: "Beta", supported_currencies: ["USD"], fee_percent: 1.5, volume_limit_usd: 100 },
      { name: "Gamma", supported_currencies: ["EUR", "GBP"], fee_percent: 1.0, volume_limit_usd: 300 },
    ];
    const rates = { USD: 1.0, EUR: 1.1 };

    const expected = [
      { id: "p1", processor: "Beta" },   // $100, fits Beta exactly 
      { id: "p2", processor: "Gamma" },  // $220, Gamma cheapest for EUR, fits
      { id: "p3", processor: "Alpha" },  // $50, Beta full, Alpha has room                                                                                                                  
      { id: "p4", processor: "Alpha" },  // $80, Beta full, Alpha has room                                                                                                                  
    ]

    const props = { payments, processors, rates }

    assert.deepStrictEqual(solution(props), expected);

  });

  it("routes payments with unsupported currencies to UNROUTED", () => {

    const result = [
      { id: "p1", processor: "UNROUTED" },
    ]

    const payments = [
      { id: "p1", amount: 100, currency: "USD" },
    ];

    const processors = [
    ];

    const props = { payments, processors, rates: { "USD": 1 } }

    assert.deepStrictEqual(solution(props), result);

  });
});
