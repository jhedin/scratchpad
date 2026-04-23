import assert from "node:assert/strict";
import { describe, it, type TestContext } from "node:test";
import { readFile, rm, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { integration } from "./solution.ts";

const TMP = join(process.cwd(), ".test-output");

describe("integration", () => {
    it("paginates, filters by stargazers, writes CSV", async (t: TestContext) => {
        await rm(TMP, { recursive: true, force: true });
        let call = 0;
        t.mock.method(globalThis, "fetch", async (input: RequestInfo | URL) => {
            call++;
            if (call === 1) {
                return new Response(
                    JSON.stringify([
                        { full_name: "user/repo-a", stargazers_count: 15, language: "TypeScript" },
                        { full_name: "user/repo-b", stargazers_count: 3, language: "Go" },
                    ]),
                    {
                        status: 200,
                        headers: {
                            Link: '<https://api.github.com/users/user/repos?page=2>; rel="next"',
                        },
                    },
                );
            }
            return new Response(
                JSON.stringify([
                    { full_name: "user/repo-c", stargazers_count: 100, language: null },
                    { full_name: "user/repo-d", stargazers_count: 1, language: "Python" },
                ]),
                { status: 200 },
            );
        });
        const outPath = await integration("user", TMP);
        assert.strictEqual(outPath, join(TMP, "user.csv"));
        const body = await readFile(outPath, "utf8");
        // Two rows with stargazers >= 10 (a and c), plus header
        assert.match(body, /^full_name,stargazers_count,language\s*$/m);
        assert.match(body, /user\/repo-a,15,TypeScript/);
        assert.match(body, /user\/repo-c,100,/); // null language: empty cell
        assert.ok(!body.includes("repo-b"), "repo-b filtered out");
        assert.ok(!body.includes("repo-d"), "repo-d filtered out");
        await rm(TMP, { recursive: true, force: true });
    });

    it("handles single-page response (no Link header)", async (t: TestContext) => {
        await rm(TMP, { recursive: true, force: true });
        t.mock.method(globalThis, "fetch", async () =>
            new Response(
                JSON.stringify([
                    { full_name: "user/solo", stargazers_count: 50, language: "Rust" },
                ]),
                { status: 200 },
            ),
        );
        const outPath = await integration("user", TMP);
        const body = await readFile(outPath, "utf8");
        assert.match(body, /user\/solo,50,Rust/);
        await rm(TMP, { recursive: true, force: true });
    });
});
