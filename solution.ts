export interface RetryOptions {
    sleep?: (ms: number) => Promise<void>;
}

const BACKOFFS_MS = [100, 200, 400];

function defaultSleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function jittered(baseMs: number): number {
    return baseMs * (0.75 + Math.random() * 0.5);
}

function parseRetryAfter(header: string | null): number | null {
    if (!header) return null;
    const asNumber = Number(header);
    if (!Number.isNaN(asNumber) && asNumber >= 0) return asNumber * 1000;
    // TODO: parse HTTP-date (e.g. "Wed, 21 Oct 2026 07:28:00 GMT"); fall back to null if unparseable.
    return null;
}

export async function callWithRetry<T>(
    url: string,
    init?: RequestInit,
    options: RetryOptions = {},
): Promise<T> {
    const sleep = options.sleep ?? defaultSleep;
    for (let attempt = 0; attempt <= BACKOFFS_MS.length; attempt++) {
        const res = await fetch(url, init);
        if (res.ok) return (await res.json()) as T;

        const isRetryable = res.status >= 500 || res.status === 429;
        if (!isRetryable) throw new Error(`HTTP ${res.status}`);
        if (attempt === BACKOFFS_MS.length) throw new Error(`HTTP ${res.status} (exhausted retries)`);

        let waitMs: number;
        if (res.status === 429) {
            const retryAfter = parseRetryAfter(res.headers.get("Retry-After"));
            waitMs = retryAfter ?? jittered(BACKOFFS_MS[attempt]!);
        } else {
            waitMs = jittered(BACKOFFS_MS[attempt]!);
        }
        await sleep(waitMs);
    }
    throw new Error("unreachable");
}
