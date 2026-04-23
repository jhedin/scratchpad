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
}

export async function listUsers(baseUrl: string, token: string, filters: Filters): Promise<User[]> {
    // TODO: implement
    return [];
}
