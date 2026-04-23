export interface ChargeBody {
    amount: number;
    currency: string;
    source: string;
}

export interface Charge {
    id: string;
    amount: number;
}

export async function chargeOnce(baseUrl: string, token: string, body: ChargeBody): Promise<Charge> {
    // TODO: generate Idempotency-Key (UUID v4), send with POST, return parsed response
    throw new Error("not implemented");
}
