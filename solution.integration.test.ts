import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { integration } from "./solution.ts";

const skip = process.env.RUN_REAL === undefined;
const TMP = join(process.cwd(), ".integration-output");

describe("integration (real network)", { skip }, () => {
    it("fetches a real GitHub user's repos and writes CSV", async () => {
        await rm(TMP, { recursive: true, force: true });
        // Use a small, stable public user. torvalds has many repos and is unlikely to vanish.
        // If rate-limited, the integration should throw — that's acceptable for this test.
        const outPath = await integration("torvalds", TMP);
        const body = await readFile(outPath, "utf8");
        // Sanity: has the header and at least one repo row.
        assert.match(body, /^full_name,stargazers_count,language/m);
        const lines = body.split("\n").filter((l) => l.length > 0);
        assert.ok(lines.length >= 2, "at least header + one row");
        await rm(TMP, { recursive: true, force: true });
    });
});
