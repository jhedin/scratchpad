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
    if (filters.role !== undefined) url.searchParams.set("role", filters.role);
    if (filters.active !== undefined) url.searchParams.set("active", filters.active ? "yes" : "no");
    if (filters.limit !== undefined) url.searchParams.set("limit", String(filters.limit));
    // TODO: send filters.createdAfter as ISO-8601 under the wire name "created_after"
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const body = (await res.json()) as { users: User[] };
    return body.users;
}
