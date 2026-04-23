export interface User {
    id: string;
    name: string;
    role: string;
    active: boolean;
}

export interface Filters {
    role?: string;
    active?: boolean;
    limit?: number;
    createdAfter?: Date;
}

export async function listUsers(baseUrl: string, token: string, filters: Filters): Promise<User[]> {
    const url = new URL(`${baseUrl}/users`);
    // TODO: Part 3 — ensure undefined filter values are omitted from the URL entirely.
    // The current code has a subtle bug: it sends `role=` when filters.role is undefined.
    url.searchParams.set("role", filters.role ?? "");
    if (filters.active !== undefined) url.searchParams.set("active", filters.active ? "yes" : "no");
    if (filters.limit !== undefined) url.searchParams.set("limit", String(filters.limit));
    if (filters.createdAfter !== undefined) {
        url.searchParams.set("created_after", filters.createdAfter.toISOString());
    }
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as { users: User[] };
    return body.users;
}
