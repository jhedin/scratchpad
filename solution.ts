export interface Event {
    id: string;
    type: string;
    created_at: string;
}

export interface ListEventsOptions {
    pageSize?: number;
}

interface Page {
    data: Event[];
    has_more: boolean;
    last_id?: string;
}

export async function* iterateEvents(
    baseUrl: string,
    token: string,
    options: ListEventsOptions = {},
): AsyncGenerator<Event> {
    // TODO: implement as an async generator that fetches pages lazily and yields events one at a time.
    // Validate pageSize as in Part 2.
    // Break out of the fetch loop as soon as the consumer stops iterating.
    throw new Error("iterateEvents not implemented");
}

export async function listEvents(
    baseUrl: string,
    token: string,
    options: ListEventsOptions = {},
): Promise<Event[]> {
    const limit = options.pageSize ?? 100;
    if (limit < 1 || limit > 1000) {
        throw new RangeError(`pageSize must be between 1 and 1000, got ${limit}`);
    }
    const out: Event[] = [];
    for await (const event of iterateEvents(baseUrl, token, options)) {
        out.push(event);
    }
    return out;
}
