export async function fetchMany<T, R>(
    items: T[],
    fetcher: (item: T) => Promise<R>,
    concurrency: number = 5,
): Promise<R[]> {
    // TODO: pool pattern — at most `concurrency` in flight; results in input order
    return [];
}
