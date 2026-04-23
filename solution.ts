export interface RetryOptions {
    sleep?: (ms: number) => Promise<void>;
    shouldRetry?: (response: Response) => boolean;
}

function defaultSleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function defaultShouldRetry(response: Response): boolean {
    return response.status >= 500;
}

const BACKOFFS_MS = [100, 200, 400];

export async function callWithRetry<T>(
    url: string,
    init?: RequestInit,
    options: RetryOptions = {},
): Promise<T> {
    const sleep = options.sleep ?? defaultSleep;
    const shouldRetry = options.shouldRetry ?? defaultShouldRetry;
    for (let attempt = 0; attempt <= BACKOFFS_MS.length; attempt++) {
        const res = await fetch(url, init);
        if (res.ok) return (await res.json()) as T;
        // TODO: use shouldRetry hook instead of hardcoding "5xx retryable"
        if (res.status >= 400 && res.status < 500) {
            throw new Error(`HTTP ${res.status}`);
        }
        if (attempt === BACKOFFS_MS.length) {
            throw new Error(`HTTP ${res.status} (exhausted retries)`);
        }
        const base = BACKOFFS_MS[attempt]!;
        const jittered = base * (0.75 + Math.random() * 0.5);
        await sleep(jittered);
    }
    throw new Error("unreachable");
}
