import type { Readable } from "node:stream";

export interface UploadPayload {
    metadata: object;
    fileBytes: Uint8Array | Buffer | Readable;
    filename: string;
}

export interface UploadOptions {
    onProgress?: (bytesSent: number) => void;
}

export interface UploadResponse {
    upload_id: string;
}

export async function normalizeFileBytes(input: Uint8Array | Buffer | Readable): Promise<Uint8Array> {
    if (input instanceof Uint8Array) return input;
    const chunks: Buffer[] = [];
    for await (const chunk of input) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return new Uint8Array(Buffer.concat(chunks));
}

const CHUNK_SIZE = 64 * 1024;

export async function upload(
    baseUrl: string,
    token: string,
    payload: UploadPayload,
    options: UploadOptions = {},
): Promise<UploadResponse> {
    const bytes = await normalizeFileBytes(payload.fileBytes);

    // TODO: if options.onProgress is provided, invoke it with cumulative bytes for each CHUNK_SIZE chunk
    //       of `bytes`, then one final call with bytes.length. For now, never invokes onProgress.

    const form = new FormData();
    form.append(
        "metadata",
        new Blob([JSON.stringify(payload.metadata)], { type: "application/json" }),
    );
    form.append(
        "file",
        new Blob([bytes], { type: "application/octet-stream" }),
        payload.filename,
    );
    const res = await fetch(`${baseUrl}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
    return (await res.json()) as UploadResponse;
}
