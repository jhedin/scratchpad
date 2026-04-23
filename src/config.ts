export interface Config {
    baseUrl: string;
    apiKey: string;
}

export function loadConfig(): Config {
    const baseUrl = process.env.API_BASE_URL ?? "https://api.example.test";
    const apiKey = process.env.API_KEY ?? "sk_test_placeholder";
    return { baseUrl, apiKey };
}
