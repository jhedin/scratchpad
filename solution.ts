export interface Charge {
    id: string;
    amount: number;
}

export interface ChargeRequest {
    amount: number;
    currency: string;
    source: string;
}

export async function createCharge(
    baseUrl: string,
    token: string,
    body: ChargeRequest,
): Promise<Charge> {
    // TODO: implement
    throw new Error("not implemented");
}
