export interface Charge {
    id: string;
    amount: number;
    currency: string;
    status: "succeeded" | "pending" | "failed";
}

export interface Refund {
    id: string;
    charge_id: string;
    amount: number;
    status: "succeeded" | "pending" | "failed";
}

export class ApiError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(`API error ${status}: ${message}`);
        this.name = "ApiError";
        this.status = status;
    }
}
