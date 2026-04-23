import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWebhook(rawBody: string, header: string, secret: string): boolean {
    // TODO: parse header (t=<unix seconds>, v1=<hex>), compute HMAC, compare with timingSafeEqual
    return false;
}
