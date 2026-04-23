import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { paginate } from "./lib/paginate.ts";
import { writeCsv } from "./lib/csv.ts";

export interface Repo {
    full_name: string;
    stargazers_count: number;
    language: string | null;
}

export async function integration(
    username: string,
    outputDir: string = "output",
): Promise<string> {
    // TODO: implement
    //   1. paginate GET https://api.github.com/users/${username}/repos using paginate()
    //   2. filter stargazers_count >= 10
    //   3. build rows: [["full_name","stargazers_count","language"], ...]
    //   4. mkdir outputDir; write to ${outputDir}/${username}.csv via writeCsv
    //   5. return the file path
    throw new Error("not implemented");
}
