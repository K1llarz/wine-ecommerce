import "server-only";

// Image/file storage seam. Swap the stub for S3 or Cloudinary by implementing
// this interface and selecting it via STORAGE_PROVIDER (see ./index.ts).

export type PresignedUpload = {
  uploadUrl: string;
  publicUrl: string;
  fields?: Record<string, string>;
};

export interface StorageProvider {
  readonly name: string;
  getUploadUrl(input: { key: string; contentType: string }): Promise<PresignedUpload>;
  delete(key: string): Promise<void>;
  publicUrl(key: string): string;
}

/**
 * Stub storage. Returns a fake presigned URL and treats the local /public
 * folder as the public namespace. Useful for wiring the admin image-upload UI
 * before real object storage is configured.
 */
export class StubStorageProvider implements StorageProvider {
  readonly name = "stub";

  async getUploadUrl(input: { key: string; contentType: string }): Promise<PresignedUpload> {
    console.info(`[storage:stub] getUploadUrl ${input.key} (${input.contentType})`);
    return {
      uploadUrl: `https://stub.local/upload/${encodeURIComponent(input.key)}`,
      publicUrl: this.publicUrl(input.key),
    };
  }

  async delete(key: string): Promise<void> {
    console.info(`[storage:stub] delete ${key}`);
  }

  publicUrl(key: string): string {
    return `/uploads/${key}`;
  }
}
