import fetch from "node-fetch";

export type Result<T> = { ok: true; value: T } | { ok: false; error: unknown };

export interface FetchManyOptions<T> {
    fetcher?: (url: string) => Promise<T>;
    concurrency?: number;
    onError?: "fail-fast" | "collect";
}

export async function defaultFetcher(url: string): Promise<unknown> {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
}

export async function fetchMany<T>(
    urls: string[],
    options: FetchManyOptions<T> = {},
): Promise<T[] | Result<T>[]> {
    const concurrency = options.concurrency ?? 5;
    const mode = options.onError ?? "fail-fast";
    const fetch_ = (options.fetcher ?? (defaultFetcher as (url: string) => Promise<T>));

    // TODO: implement mode === "collect" (never throws, returns Result<T>[])

    const results: T[] = new Array(urls.length);
    let nextIndex = 0;
    let aborted = false;
    let abortError: unknown = null;

    async function worker(): Promise<void> {
        while (true) {
            if (aborted) return;
            const idx = nextIndex++;
            if (idx >= urls.length) return;
            try {
                results[idx] = await fetch_(urls[idx]!);
            } catch (err) {
                if (!aborted) {
                    aborted = true;
                    abortError = err;
                }
                return;
            }
        }
    }

    const n = Math.min(concurrency, urls.length);
    await Promise.all(Array.from({ length: n }, () => worker()));
    if (aborted) throw abortError;
    return results;
}
