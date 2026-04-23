import { httpPost } from "../http.ts";
import { loadConfig } from "../config.ts";
import { sleep } from "../util/sleep.ts";
import type { Refund } from "../types.ts";

export interface CreateRefundInput {
    charge_id: string;
    amount: number;
}

/**
 * Create a refund by POSTing to /refunds.
 *
 * Follow the pattern in charge-service.ts — use loadConfig() and httpPost().
 */
export async function createRefund(input: CreateRefundInput): Promise<Refund> {
    // TODO: implement using httpPost — pattern mirrors createCharge in charge-service.ts
    throw new Error("not implemented");
}
