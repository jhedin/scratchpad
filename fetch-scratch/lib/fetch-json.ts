export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${body}`);
    }
    return (await res.json()) as T;
}
