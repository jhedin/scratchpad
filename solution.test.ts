import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { listRepos } from "./solution.ts";

function reposResponse(repos: Array<{ id: number; full_name: string; stargazers_count: number }>, linkHeader?: string): Response {
    return new Response(JSON.stringify(repos), {
        status: 200,
        headers: linkHeader ? { Link: linkHeader } : {},
    });
}

describe("listRepos", () => {
    it("follows rel=\"next\" across pages", async (t: TestContext) => {
        const calls: string[] = [];
        t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
            const url = input instanceof URL ? input.href : String(input);
            calls.push(url);
            if (calls.length === 1) {
                return reposResponse(
                    [{ id: 1, full_name: "a/b", stargazers_count: 1 }],
                    '<https://api.example.test/users/owner/repos?page=2>; rel="next", <https://api.example.test/users/owner/repos?page=3>; rel="last"',
                );
            }
            if (calls.length === 2) {
                return reposResponse(
                    [{ id: 2, full_name: "c/d", stargazers_count: 2 }],
                    '<https://api.example.test/users/owner/repos?page=3>; rel="next", <https://api.example.test/users/owner/repos?page=3>; rel="last"',
                );
            }
            return reposResponse([{ id: 3, full_name: "e/f", stargazers_count: 3 }]);
        });
        const repos = await listRepos("https://api.example.test", "owner");
        assert.deepStrictEqual(repos.map((r) => r.id), [1, 2, 3]);
        assert.strictEqual(calls.length, 3);
    });

    it("handles relative Link URLs", async (t: TestContext) => {
        const calls: string[] = [];
        t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
            const url = input instanceof URL ? input.href : String(input);
            calls.push(url);
            if (calls.length === 1) {
                return reposResponse(
                    [{ id: 1, full_name: "a/b", stargazers_count: 1 }],
                    '</users/owner/repos?page=2>; rel="next"',
                );
            }
            return reposResponse([{ id: 2, full_name: "c/d", stargazers_count: 2 }]);
        });
        const repos = await listRepos("https://api.example.test", "owner");
        assert.deepStrictEqual(repos.map((r) => r.id), [1, 2]);
        assert.strictEqual(calls[1], "https://api.example.test/users/owner/repos?page=2");
    });

    it("stops when the Link header has no rel=\"next\"", async (t: TestContext) => {
        let callCount = 0;
        t.mock.method(globalThis, "fetch", async () => {
            callCount++;
            return reposResponse(
                [{ id: 1, full_name: "a/b", stargazers_count: 1 }],
                '<https://api.example.test/users/owner/repos?page=1>; rel="prev", <https://api.example.test/users/owner/repos?page=1>; rel="first"',
            );
        });
        const repos = await listRepos("https://api.example.test", "owner");
        assert.strictEqual(repos.length, 1);
        assert.strictEqual(callCount, 1);
    });
});

describe("listRepos single-page case (no Link header)", () => {
    it("returns the single page when Link header is absent", async (t: TestContext) => {
        t.mock.method(globalThis, "fetch", async () =>
            reposResponse([
                { id: 1, full_name: "solo/repo", stargazers_count: 42 },
            ]),
        );
        const repos = await listRepos("https://api.example.test", "solo");
        assert.deepStrictEqual(repos.map((r) => r.id), [1]);
    });
});
