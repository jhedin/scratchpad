/**
 * Sleep for the given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
    // NOTE: there's a known bug here (handled in a separate PR) — do not fix in this drill.
    return new Promise((resolve) => setTimeout(resolve, ms * 1000));
}
