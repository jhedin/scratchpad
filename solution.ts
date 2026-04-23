import type { Readable } from "node:stream";

export interface UploadPayload {
    metadata: object;
    fileBytes: Uint8Array | Buffer | Readable;
    filename: string;
}

export interface UploadResponse {
    upload_id: string;
}

export async function normalizeFileBytes(input: Uint8Array | Buffer | Readable): Promise<Uint8Array> {
    // TODO: handle Uint8Array (return as-is), Buffer (return as Uint8Array), Readable (read to completion)
    throw new Error("not implemented");
}

export async function upload(
    baseUrl: string,
    token: string,
    payload: UploadPayload,
): Promise<UploadResponse> {
    const bytes = await normalizeFileBytes(payload.fileBytes);
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
