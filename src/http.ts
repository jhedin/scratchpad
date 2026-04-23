import { ApiError } from "./types.ts";

export interface HttpOptions {
    baseUrl: string;
    apiKey: string;
}

export async function httpGet<T>(opts: HttpOptions, path: string): Promise<T> {
    const res = await fetch(`${opts.baseUrl}${path}`, {
        headers: { Authorization: `Bearer ${opts.apiKey}` },
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return (await res.json()) as T;
}

export async function httpPost<T>(opts: HttpOptions, path: string, body: unknown): Promise<T> {
    const res = await fetch(`${opts.baseUrl}${path}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${opts.apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new ApiError(res.status, await res.text());
    return (await res.json()) as T;
}
