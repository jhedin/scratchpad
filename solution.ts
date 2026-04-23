import axios, { type AxiosRequestConfig, isAxiosError } from "axios";

export interface RetryOptions {
    sleep?: (ms: number) => Promise<void>;
}

function defaultSleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const BACKOFFS_MS = [100, 200, 400];

export async function callWithRetry<T>(
    url: string,
    config?: AxiosRequestConfig,
    options: RetryOptions = {},
): Promise<T> {
    const sleep = options.sleep ?? defaultSleep;
    for (let attempt = 0; attempt <= BACKOFFS_MS.length; attempt++) {
        try {
            const res = await axios.get<T>(url, config);
            return res.data;
        } catch (err) {
            if (!isAxiosError(err) || !err.response) throw err;
            const status = err.response.status;
            if (status < 500) throw err;
            if (attempt === BACKOFFS_MS.length) throw err;
            // TODO: apply ±25% jitter to BACKOFFS_MS[attempt]
            await sleep(BACKOFFS_MS[attempt]!);
        }
    }
    throw new Error("unreachable");
}
