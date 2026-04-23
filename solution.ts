export type Result<R> = { ok: true; value: R } | { ok: false; error: unknown };

export interface FetchManyOptions {
    concurrency?: number;
    onError?: "fail-fast" | "collect";
}

// Function overloads:
export async function fetchMany<T, R>(
    items: T[],
    fetcher: (item: T) => Promise<R>,
    options: { concurrency?: number; onError?: "fail-fast" },
): Promise<R[]>;
export async function fetchMany<T, R>(
    items: T[],
    fetcher: (item: T) => Promise<R>,
    options: { concurrency?: number; onError: "collect" },
): Promise<Result<R>[]>;
export async function fetchMany<T, R>(
    items: T[],
    fetcher: (item: T) => Promise<R>,
    options?: FetchManyOptions,
): Promise<R[] | Result<R>[]>;
export async function fetchMany<T, R>(
    items: T[],
    fetcher: (item: T) => Promise<R>,
    options: FetchManyOptions = {},
): Promise<R[] | Result<R>[]> {
    const concurrency = options.concurrency ?? 5;
    const mode = options.onError ?? "fail-fast";

    // TODO: implement mode === "collect" — never throws, returns array of {ok, ...}.

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
