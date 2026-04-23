export interface Repo {
    id: number;
    full_name: string;
    stargazers_count: number;
}

export class TooManyPagesError extends Error {
    constructor(pagesFetched: number) {
        super(`exceeded maxPages limit (fetched ${pagesFetched} pages)`);
        this.name = "TooManyPagesError";
    }
}

function parseNextLink(header: string | null, baseUrl: string): string | null {
    if (!header) return null;
    const parts = header.split(",");
    for (const part of parts) {
        const match = /<([^>]+)>\s*;\s*rel="([^"]+)"/.exec(part.trim());
        if (!match) continue;
        const [, url, rel] = match;
        if (rel === "next") return new URL(url!, baseUrl).href;
    }
    return null;
}

export interface IterateOptions {
    maxPages?: number;
}

export async function* iterateRepos(
    baseUrl: string,
    owner: string,
    options: IterateOptions = {},
): AsyncGenerator<Repo> {
    // TODO: implement — yield each repo, follow Link rel=next, enforce maxPages.
    throw new Error("iterateRepos not implemented");
}

export async function listRepos(baseUrl: string, owner: string): Promise<Repo[]> {
    const out: Repo[] = [];
    for await (const repo of iterateRepos(baseUrl, owner)) {
        out.push(repo);
    }
    return out;
}
