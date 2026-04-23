import { createHmac, timingSafeEqual } from "node:crypto";

export interface VerifyOptions {
    toleranceSeconds?: number;
    now?: () => number;
}

function parseHeader(header: string): { t: number | null; v1: string | null } {
    const out = { t: null as number | null, v1: null as string | null };
    for (const rawSegment of header.split(",")) {
        const segment = rawSegment.trim();
        const eq = segment.indexOf("=");
        if (eq === -1) continue;
        const key = segment.slice(0, eq).trim();
        const value = segment.slice(eq + 1).trim();
        if (key === "t") {
            const n = Number(value);
            if (!Number.isNaN(n)) out.t = n;
        } else if (key === "v1") {
            out.v1 = value;
        }
    }
    return out;
}

function safeHexEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    try {
        return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
    } catch {
        return false;
    }
}

export function verifyWebhook(
    rawBody: string,
    header: string,
    secret: string,
    options: VerifyOptions = {},
): boolean {
    const parsed = parseHeader(header);
    if (parsed.t === null || parsed.v1 === null) return false;
    // TODO: reject if |now - parsed.t| > toleranceSeconds (default 300).
    // now defaults to () => Math.floor(Date.now() / 1000)
    const expected = createHmac("sha256", secret).update(`${parsed.t}.${rawBody}`).digest("hex");
    return safeHexEqual(parsed.v1, expected);
}
