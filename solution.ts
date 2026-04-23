export type Event = unknown;

function parseEvents(chunk: string): { events: Event[]; done: boolean } {
    const events: Event[] = [];
    for (const block of chunk.split("\n\n")) {
        for (const line of block.split("\n")) {
            if (line.startsWith(":")) continue;
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (payload === "[DONE]") return { events, done: true };
            if (payload.length === 0) continue;
            events.push(JSON.parse(payload));
        }
    }
    return { events, done: false };
}

export async function* iterEvents(baseUrl: string): AsyncGenerator<Event> {
    // TODO: implement as async generator. Must cancel the reader on early break.
    //       Use a try/finally block and call reader.cancel() in finally.
    throw new Error("iterEvents not implemented");
}

export async function readAllEvents(baseUrl: string): Promise<Event[]> {
    const out: Event[] = [];
    for await (const event of iterEvents(baseUrl)) {
        out.push(event);
    }
    return out;
}
