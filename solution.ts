import fetch from "node-fetch";

export async function defaultFetcher(url: string): Promise<unknown> {
    // TODO: GET url with node-fetch. Throw on non-2xx. Return parsed JSON.
    //       Use res.json() — do NOT use res.body.getReader() (node-fetch body is a Node stream).
    throw new Error("defaultFetcher not implemented");
}

export async function fetchMany<T>(
    urls: string[],
    fetcher?: (url: string) => Promise<T>,
    concurrency: number = 5,
): Promise<T[]> {
    const fetch_ = (fetcher ?? (defaultFetcher as (url: string) => Promise<T>));
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
