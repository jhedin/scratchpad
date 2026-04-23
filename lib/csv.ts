import { writeFile } from "node:fs/promises";

export async function writeCsv(path: string, rows: string[][]): Promise<void> {
    // TODO: write rows as CSV. Quote fields containing commas, quotes, or newlines
    //       (use RFC 4180 quoting: wrap in double-quotes, escape internal quotes by doubling).
    throw new Error("writeCsv not implemented");
}
