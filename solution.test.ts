import assert from "node:assert/strict";
import { describe, it } from "node:test";
// assert.deepStrictEqual(a, b) — deep equality (arrays, objects, ignores key order)
// assert.strictEqual(a, b)     — primitives (===)
// assert.ok(value)             — truthy check
// assert.throws(() => fn())    — expects an error
import { RateLimiter } from "./solution.ts";

describe("solution", () => {

    it("limits rates", () => {

        const limiter = RateLimiter({
            tiers: [
                { capacity: 2, refillPeriod: 3 },
                { capacity: 3, refillPeriod: 100 },
            ]
        });
        console.log("u1", 0)
        assert.ok(limiter.allowRequest("u1", 0));   // true,  tokens: 1, 3                                                                                                                                       
        console.log("u1", 1)
        assert.ok(limiter.allowRequest("u1", 1));   // true,  tokens: 0, 2                                                                                                                                        
        console.log("u1", 2)
        assert.ok(!limiter.allowRequest("u1", 2));   // false,  no tokens                                                                                                                                         
        console.log("u1", 4)
        assert.ok(limiter.allowRequest("u1", 4));   // true, tokens 0, 1                                                                                                                                  
        console.log("u1", 50)
        assert.ok(!limiter.allowRequest("u1", 50));  // false,  tokens, 0, 0
        console.log("u1", 100)
        assert.ok(limiter.allowRequest("u1", 100));  // true,  refill happened


    });

    it(" no limits when no tiers", () => {

        const limiter = RateLimiter({
            tiers: [
            ]
        });
        console.log("u1", 0)
        assert.ok(limiter.allowRequest("u1", 0));   // true,  tokens: 1, 3                                                                                                                                       
        console.log("u1", 1)
        assert.ok(limiter.allowRequest("u1", 1));   // true,  tokens: 0, 2                                                                                                                                        
        console.log("u1", 2)
        assert.ok(limiter.allowRequest("u1", 2));   // false,  no tokens                                                                                                                                         
        console.log("u1", 4)
        assert.ok(limiter.allowRequest("u1", 4));   // true, tokens 0, 1                                                                                                                                  
        console.log("u1", 50)
        assert.ok(limiter.allowRequest("u1", 50));  // false,  tokens, 0, 0
        console.log("u1", 100)
        assert.ok(limiter.allowRequest("u1", 100));  // true,  refill happened


    });


});
