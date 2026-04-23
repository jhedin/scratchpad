export async function fetchMany<T>(
    urls: string[],
    fetcher: (url: string) => Promise<T>,
    concurrency: number = 5,
): Promise<T[]> {
    // TODO: pool pattern, input order, fail-fast on error
    return [];
}
