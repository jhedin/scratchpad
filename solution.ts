export interface Repo {
    id: number;
    full_name: string;
    stargazers_count: number;
}

function parseNextLink(header: string | null, baseUrl: string): string | null {
    // TODO: handle header === null (no Link header means no next page) — currently crashes
    const parts = header!.split(",");
    for (const part of parts) {
        const match = /<([^>]+)>\s*;\s*rel="([^"]+)"/.exec(part.trim());
        if (!match) continue;
        const [, url, rel] = match;
        if (rel === "next") {
            return new URL(url!, baseUrl).href;
        }
    }
    return null;
}

export async function listRepos(baseUrl: string, owner: string): Promise<Repo[]> {
    const out: Repo[] = [];
    let url: string | null = `${baseUrl}/users/${owner}/repos`;
    while (url !== null) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const page = (await res.json()) as Repo[];
        out.push(...page);
        url = parseNextLink(res.headers.get("Link"), baseUrl);
    }
    return out;
}
