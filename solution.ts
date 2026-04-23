interface Me {
    id: string;
    email: string;
    plan: string;
}

type TokenInput = string | { apiKey: string };

export class AuthError extends Error {
    requestId: string | null;
    constructor(message: string, requestId: string | null) {
        super(message);
        this.name = "AuthError";
        this.requestId = requestId;
    }
}

function normalizeToken(token: TokenInput): string {
    return typeof token === "string" ? token : token.apiKey;
}

export async function whoAmI(baseUrl: string, token: TokenInput): Promise<Me> {
    const apiKey = normalizeToken(token);
    const res = await fetch(`${baseUrl}/me`, {
        headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (res.status === 401) {
        // TODO: throw AuthError with the X-Request-Id header propagated
        throw new AuthError("Unauthorized", null);
    }
    if (!res.ok) {
        const body = await res.text();
        throw new Error(`HTTP ${res.status}: ${body.slice(0, 200)}`);
    }
    return (await res.json()) as Me;
}
