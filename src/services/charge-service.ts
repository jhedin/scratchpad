import { httpPost } from "../http.ts";
import { loadConfig } from "../config.ts";
import type { Charge } from "../types.ts";

export async function createCharge(amount: number, currency: string, source: string): Promise<Charge> {
    const config = loadConfig();
    return await httpPost<Charge>(config, "/charges", { amount, currency, source });
}
