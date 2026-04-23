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

export async function readAllEvents(baseUrl: string): Promise<Event[]> {
    const res = await fetch(`${baseUrl}/events/stream`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (!res.body) throw new Error("no response body");
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    const out: Event[] = [];
    // TODO: buffer across reads. Currently parses each chunk in isolation, which breaks when
    //       an event spans chunk boundaries (JSON.parse throws on partial content).
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const parsed = parseEvents(chunk);
        out.push(...parsed.events);
        if (parsed.done) {
            await reader.cancel();
            return out;
        }
    }
    return out;
}
