export interface UploadPayload {
    metadata: object;
    fileBytes: Uint8Array;
    filename: string;
}

export interface UploadResponse {
    upload_id: string;
}

export async function upload(
    baseUrl: string,
    token: string,
    payload: UploadPayload,
): Promise<UploadResponse> {
    // TODO: implement multipart upload using FormData + Blob
    throw new Error("not implemented");
}
