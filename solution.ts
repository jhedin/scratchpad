export interface Charge {
    id: string;
    amount: number;
}

export interface ChargeRequest {
    amount: number;
    currency: string;
    source: string;
}

interface ErrorShape {
    type: string;
    code: string;
    message: string;
    param?: string;
}

export class ApiError extends Error {
    type: string;
    code: string;
    param: string | null;
    status: number;
    constructor(shape: ErrorShape, status: number) {
        super(`${shape.type}/${shape.code}: ${shape.message}`);
        this.name = "ApiError";
        this.type = shape.type;
        this.code = shape.code;
        this.param = shape.param ?? null;
        this.status = status;
    }
}

function extractError(body: unknown): ErrorShape {
    if (typeof body === "object" && body !== null) {
        const maybe = body as { error?: unknown } & Partial<ErrorShape>;
        if (typeof maybe.error === "object" && maybe.error !== null) {
            return maybe.error as ErrorShape;
        }
        if (typeof maybe.type === "string" && typeof maybe.code === "string" && typeof maybe.message === "string") {
            return maybe as ErrorShape;
        }
    }
    return { type: "unknown", code: "unknown", message: "unknown error" };
}

export async function createCharge(
    baseUrl: string,
    token: string,
    body: ChargeRequest,
): Promise<Charge> {
    const res = await fetch(`${baseUrl}/charges`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        const shape = extractError(json);
        // TODO: throw ApiError instead of plain Error, with status attached
        throw new Error(`${shape.type}/${shape.code}: ${shape.message}`);
    }
    return (await res.json()) as Charge;
}
