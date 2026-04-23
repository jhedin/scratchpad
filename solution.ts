interface Options {
    timeoutMs?: number;
}

async function fetchStatus(
    baseUrl: string,
    options: Options = {},
): Promise<{ ok: unknown; version?: unknown } | null> {
    // TODO: honor options.timeoutMs with AbortSignal.timeout (default 2000ms)
    try {
        const res = await fetch(`${baseUrl}/status`);
        if (!res.ok) return null;
        return (await res.json()) as { ok: unknown; version?: unknown };
    } catch {
        return null;
    }
}

export async function isHealthy(baseUrl: string, options: Options = {}): Promise<boolean> {
    const body = await fetchStatus(baseUrl, options);
    return body !== null && body.ok === true;
}

export async function getVersion(baseUrl: string, options: Options = {}): Promise<string | null> {
    const body = await fetchStatus(baseUrl, options);
    if (body === null) return null;
    return typeof body.version === "string" ? body.version : null;
}
