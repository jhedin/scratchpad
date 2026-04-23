import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createHmac } from "node:crypto";
import { verifyWebhook } from "./solution.ts";

function sign(secret: string, timestamp: number, body: string): string {
    return createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
}

describe("verifyWebhook", () => {
    const secret = "whsec_test";
    const body = '{"event":"charge.succeeded","amount":1000}';
    const ts = 1700000000;

    it("returns true for a valid signature", () => {
        const v1 = sign(secret, ts, body);
        const header = `t=${ts},v1=${v1}`;
        assert.strictEqual(verifyWebhook(body, header, secret), true);
    });

    it("returns false for a mismatched signature", () => {
        const header = `t=${ts},v1=${"0".repeat(64)}`;
        assert.strictEqual(verifyWebhook(body, header, secret), false);
    });

    it("returns false for a malformed header", () => {
        assert.strictEqual(verifyWebhook(body, "not-a-valid-header", secret), false);
        assert.strictEqual(verifyWebhook(body, "", secret), false);
    });

    it("tolerates whitespace around header segments", () => {
        const v1 = sign(secret, ts, body);
        const header = ` t=${ts} , v1=${v1} `;
        assert.strictEqual(verifyWebhook(body, header, secret), true);
    });
});

describe("verifyWebhook timestamp tolerance", () => {
    const secret = "whsec_test";
    const body = '{"x":1}';
    const ts = 1700000000;

    it("rejects when timestamp is older than tolerance", () => {
        const v1 = sign(secret, ts, body);
        const header = `t=${ts},v1=${v1}`;
        const now = () => ts + 400; // 400s past the signed timestamp, default 300 tolerance
        assert.strictEqual(verifyWebhook(body, header, secret, { now }), false);
    });

    it("accepts within tolerance", () => {
        const v1 = sign(secret, ts, body);
        const header = `t=${ts},v1=${v1}`;
        const now = () => ts + 100;
        assert.strictEqual(verifyWebhook(body, header, secret, { now }), true);
    });

    it("honors custom toleranceSeconds", () => {
        const v1 = sign(secret, ts, body);
        const header = `t=${ts},v1=${v1}`;
        const now = () => ts + 60;
        assert.strictEqual(verifyWebhook(body, header, secret, { toleranceSeconds: 30, now }), false);
    });
});
