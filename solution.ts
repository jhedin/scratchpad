export interface RetryOptions {
    sleep?: (ms: number) => Promise<void>;
}

export async function callWithRetry<T>(
    url: string,
    init?: RequestInit,
    options: RetryOptions = {},
): Promise<T> {
    // TODO: implement
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
}
