export async function callWithRetry<T>(url: string, init?: RequestInit): Promise<T> {
    // TODO: implement retry with exponential backoff 100/200/400ms on 5xx, fail fast on 4xx
    const res = await fetch(url, init);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
}
