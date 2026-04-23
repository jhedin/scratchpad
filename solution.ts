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

export async function listEvents(
    baseUrl: string,
    token: string,
    options: ListEventsOptions = {},
): Promise<Event[]> {
    // TODO: validate options.pageSize (default 100, max 1000, min 1; throw RangeError on out-of-bounds)
    const limit = options.pageSize ?? 100;
    const out: Event[] = [];
    let startingAfter: string | undefined;
    while (true) {
        const url = new URL(`${baseUrl}/events`);
        url.searchParams.set("limit", String(limit));
        if (startingAfter !== undefined) url.searchParams.set("starting_after", startingAfter);
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const page = (await res.json()) as Page;
        out.push(...page.data);
        if (!page.has_more) break;
        startingAfter = page.last_id ?? page.data[page.data.length - 1]?.id;
        if (startingAfter === undefined) break;
    }
    return out;
}
