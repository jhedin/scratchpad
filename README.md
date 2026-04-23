# Drill 12: Multipart Upload

Upload a file with JSON metadata via `multipart/form-data`. Let fetch set the Content-Type.

**Scenario:** `POST /upload` with two multipart fields:
- `metadata`: JSON blob
- `file`: binary with filename

Example curl:
```
curl -H 'Authorization: Bearer sk_test_x' \
  -F 'metadata={"name":"logo.png"};type=application/json' \
  -F 'file=@logo.png' \
  https://api.example.test/upload
```

## Part 1

Implement `upload(baseUrl, token, payload): Promise<{upload_id: string}>`. `payload` is `{metadata: object; fileBytes: Uint8Array; filename: string}`. Use native `FormData` + `Blob`. DO NOT set Content-Type manually — let fetch set the multipart boundary. POST with bearer auth.

## Part 2

Accept `fileBytes` as `Uint8Array | Buffer | Readable`. Export `normalizeFileBytes(input): Promise<Uint8Array>`.

## Part 3

Add `options.onProgress?: (bytesSent: number) => void`. Report upload progress. Simplest implementation: pre-compute total size and invoke onProgress before fetch. Stretch: yield in 64KB chunks, calling onProgress cumulatively.

## How to run

```
npm install
npm test
```
