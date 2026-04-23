async function fetchStatus(baseUrl: string): Promise<{ ok: unknown; version?: unknown } | null> {
    try {
        const res = await fetch(`${baseUrl}/status`);
        if (!res.ok) return null;
        return (await res.json()) as { ok: unknown; version?: unknown };
    } catch {
        return null;
    }
}

export async function isHealthy(baseUrl: string): Promise<boolean> {
    const body = await fetchStatus(baseUrl);
    return body !== null && body.ok === true;
}

export async function getVersion(baseUrl: string): Promise<string | null> {
    // TODO: implement
    return null;
}
