import { randomUUID } from "node:crypto";

export interface ChargeBody {
    amount: number;
    currency: string;
    source: string;
}

export interface Charge {
    id: string;
    amount: number;
}

export interface ChargeOptions {
    sleep?: (ms: number) => Promise<void>;
}

const BACKOFFS_MS = [100, 200, 400];

function defaultSleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function chargeOnce(
    baseUrl: string,
    token: string,
    body: ChargeBody,
    options: ChargeOptions = {},
): Promise<Charge> {
    const sleep = options.sleep ?? defaultSleep;
    // TODO: the idempotency key must be generated ONCE, outside the retry loop.
    // Currently it's regenerated on every attempt — which defeats idempotency.
    for (let attempt = 0; attempt <= BACKOFFS_MS.length; attempt++) {
        const idempotencyKey = randomUUID(); // BUG: should be outside the loop
        const res = await fetch(`${baseUrl}/charges`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "Idempotency-Key": idempotencyKey,
            },
            body: JSON.stringify(body),
        });
        if (res.ok) return (await res.json()) as Charge;
        if (res.status < 500) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
        }
        if (attempt === BACKOFFS_MS.length) {
            throw new Error(`HTTP ${res.status} (exhausted retries)`);
        }
        await sleep(BACKOFFS_MS[attempt]!);
    }
    throw new Error("unreachable");
}
