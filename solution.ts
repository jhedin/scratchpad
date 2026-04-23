export interface Event {
    id: string;
    type: string;
    created_at: string;
}

export async function listEvents(baseUrl: string, token: string): Promise<Event[]> {
    // TODO: implement — fetch all pages, concatenate
    return [];
}
