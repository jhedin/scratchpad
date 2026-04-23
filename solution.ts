import axios, { type AxiosRequestConfig, type AxiosError, isAxiosError } from "axios";

export interface RetryOptions {
    sleep?: (ms: number) => Promise<void>;
    shouldRetry?: (err: AxiosError) => boolean;
}

function defaultSleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function defaultShouldRetry(err: AxiosError): boolean {
    return (err.response?.status ?? 0) >= 500;
}

const BACKOFFS_MS = [100, 200, 400];

export async function callWithRetry<T>(
    url: string,
    config?: AxiosRequestConfig,
    options: RetryOptions = {},
): Promise<T> {
    const sleep = options.sleep ?? defaultSleep;
    const shouldRetry = options.shouldRetry ?? defaultShouldRetry;
    for (let attempt = 0; attempt <= BACKOFFS_MS.length; attempt++) {
        try {
            const res = await axios.get<T>(url, config);
            return res.data;
        } catch (err) {
            if (!isAxiosError(err) || !err.response) throw err;
            // TODO: use shouldRetry(err) hook instead of hardcoded 5xx check
            const status = err.response.status;
            if (status < 500) throw err;
            if (attempt === BACKOFFS_MS.length) throw err;
            const base = BACKOFFS_MS[attempt]!;
            const jittered = base * (0.75 + Math.random() * 0.5);
            await sleep(jittered);
        }
    }
    throw new Error("unreachable");
}
