export interface RetryOptions {
    sleep?: (ms: number) => Promise<void>;
}

function defaultSleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const BACKOFFS_MS = [100, 200, 400];

export async function callWithRetry<T>(
    url: string,
    init?: RequestInit,
    options: RetryOptions = {},
): Promise<T> {
    const sleep = options.sleep ?? defaultSleep;
    for (let attempt = 0; attempt <= BACKOFFS_MS.length; attempt++) {
        const res = await fetch(url, init);
        if (res.ok) return (await res.json()) as T;
        if (res.status >= 400 && res.status < 500) {
            throw new Error(`HTTP ${res.status}`);
        }
        if (attempt === BACKOFFS_MS.length) {
            throw new Error(`HTTP ${res.status} (exhausted retries)`);
        }
        // TODO: apply ±25% jitter to BACKOFFS_MS[attempt]
        await sleep(BACKOFFS_MS[attempt]!);
    }
    throw new Error("unreachable");
}
