interface Me {
    id: string;
    email: string;
    plan: string;
}

type TokenInput = string | { apiKey: string };

function normalizeToken(token: TokenInput): string {
    // TODO: accept both string and { apiKey } shapes
    return "";
}

export async function whoAmI(baseUrl: string, token: TokenInput): Promise<Me> {
    const apiKey = normalizeToken(token);
    const res = await fetch(`${baseUrl}/me`, {
        headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
    }
    return (await res.json()) as Me;
}
