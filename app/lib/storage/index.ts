import { uploadToCloudinary } from "./cloudinary";
import type { StoredMedia, UploadMediaInput } from "./types";

export async function uploadMedia(
  input: UploadMediaInput,
): Promise<StoredMedia> {
  const provider = process.env.MEDIA_STORAGE_PROVIDER ?? "cloudinary";

  if (provider !== "cloudinary") {
    throw new Error(`Unsupported media storage provider: ${provider}`);
  }

  return uploadToCloudinary(input);
}

export type { MediaResourceType, StoredMedia, UploadMediaInput } from "./types";
