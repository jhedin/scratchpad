import { randomUUID, createHash } from "node:crypto";

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
    store?: IdempotencyStore;
}

const BACKOFFS_MS = [100, 200, 400];

function defaultSleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export class IdempotencyMismatchError extends Error {
    constructor(key: string) {
        super(`idempotency key ${key} reused with a different body`);
        this.name = "IdempotencyMismatchError";
    }
}

interface StoredEntry {
    bodyHash: string;
    response: Charge;
}

export class IdempotencyStore {
    private readonly max: number;
    private readonly map = new Map<string, StoredEntry>();

    constructor(max = 1000) {
        this.max = max;
    }

    get(key: string): StoredEntry | undefined {
        const entry = this.map.get(key);
        if (entry === undefined) return undefined;
        // LRU touch
        this.map.delete(key);
        this.map.set(key, entry);
        return entry;
    }

    set(key: string, bodyHash: string, response: Charge): void {
        if (this.map.has(key)) this.map.delete(key);
        this.map.set(key, { bodyHash, response });
        if (this.map.size > this.max) {
            const oldest = this.map.keys().next().value;
            if (oldest !== undefined) this.map.delete(oldest);
        }
    }
}

function hashBody(body: ChargeBody): string {
    return createHash("sha256").update(JSON.stringify(body)).digest("hex");
}

const defaultStore = new IdempotencyStore();

export async function chargeOnce(
    baseUrl: string,
    token: string,
    body: ChargeBody,
    options: ChargeOptions = {},
): Promise<Charge> {
    const sleep = options.sleep ?? defaultSleep;
    const store = options.store ?? defaultStore;
    const idempotencyKey = randomUUID();
    // TODO: check store for idempotencyKey. If present and bodyHash matches, return cached response.
    //       If present and bodyHash differs, throw IdempotencyMismatchError.
    //       After success, store { bodyHash, response } under idempotencyKey.
    for (let attempt = 0; attempt <= BACKOFFS_MS.length; attempt++) {
        const res = await fetch(`${baseUrl}/charges`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                "Idempotency-Key": idempotencyKey,
            },
            body: JSON.stringify(body),
        });
        if (res.ok) {
            const charge = (await res.json()) as Charge;
            return charge;
        }
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

// Exported for tests
export function __keyForTest(baseUrl: string, body: ChargeBody): string {
    return hashBody(body);
}
