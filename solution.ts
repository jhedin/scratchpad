export interface Repo {
    id: number;
    full_name: string;
    stargazers_count: number;
}

export async function listRepos(baseUrl: string, owner: string): Promise<Repo[]> {
    // TODO: implement — fetch all pages by following rel="next" in Link header
    return [];
}
