import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { listUsers } from "./solution.ts";

describe("listUsers", () => {
    it("sends the bearer token and returns the users array", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
            const headers = new Headers(init?.headers);
            assert.strictEqual(headers.get("Authorization"), "Bearer sk_test_abc");
            return new Response(
                JSON.stringify({ users: [{ id: "u_1", name: "A", role: "admin", active: true }] }),
                { status: 200 },
            );
        });
        const users = await listUsers("https://api.example.test", "sk_test_abc", {});
        assert.strictEqual(users.length, 1);
        assert.strictEqual(users[0]!.id, "u_1");
    });

    it("encodes role and active as query params (active uses the 'yes'/'no' wire format)", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
            const url = input instanceof URL ? input : new URL(String(input));
            assert.strictEqual(url.searchParams.get("role"), "admin");
            assert.strictEqual(url.searchParams.get("active"), "yes");
            return new Response(JSON.stringify({ users: [] }), { status: 200 });
        });
        await listUsers("https://api.example.test", "sk_test_abc", { role: "admin", active: true });
    });

    it("encodes active=false as 'no'", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
            const url = input instanceof URL ? input : new URL(String(input));
            assert.strictEqual(url.searchParams.get("active"), "no");
            return new Response(JSON.stringify({ users: [] }), { status: 200 });
        });
        await listUsers("https://api.example.test", "sk_test_abc", { active: false });
    });

    it("encodes limit", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
            const url = input instanceof URL ? input : new URL(String(input));
            assert.strictEqual(url.searchParams.get("limit"), "50");
            return new Response(JSON.stringify({ users: [] }), { status: 200 });
        });
        await listUsers("https://api.example.test", "sk_test_abc", { limit: 50 });
    });
});
