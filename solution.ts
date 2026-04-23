export interface FetchManyOptions {
    concurrency?: number;
}

export async function fetchMany<T, R>(
    items: T[],
    fetcher: (item: T) => Promise<R>,
    options: FetchManyOptions = {},
): Promise<R[]> {
    // TODO: use options.concurrency (default 5). Currently hardcoded to 1 (serial).
    const concurrency = 1;
    const results: R[] = new Array(items.length);
    let nextIndex = 0;
    let aborted = false;
    let abortError: unknown = null;

    async function worker(): Promise<void> {
        while (true) {
            if (aborted) return;
            const idx = nextIndex++;
            if (idx >= items.length) return;
            try {
                results[idx] = await fetcher(items[idx]!);
            } catch (err) {
                if (!aborted) {
                    aborted = true;
                    abortError = err;
                }
                return;
            }
        }
    }

    const n = Math.min(concurrency, items.length);
    const workers = Array.from({ length: n }, () => worker());
    await Promise.all(workers);
    if (aborted) throw abortError;
    return results;
}
