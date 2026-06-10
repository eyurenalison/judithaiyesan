import type { UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";
import type { StoredMedia, UploadMediaInput } from "./types";

function configureCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  cloudinary.config({
    api_key: apiKey,
    api_secret: apiSecret,
    cloud_name: cloudName,
    secure: true,
  });
}

function uploadBuffer({
  buffer,
  folder,
  resourceType,
}: {
  buffer: Buffer;
  folder: string;
  resourceType: UploadMediaInput["resourceType"];
}) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType ?? "auto",
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }

        resolve(result);
      },
    );

    stream.end(buffer);
  });
}

export async function uploadToCloudinary({
  file,
  folder,
  resourceType = "auto",
}: UploadMediaInput): Promise<StoredMedia> {
  configureCloudinary();

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const result = await uploadBuffer({
    buffer,
    folder: folder ?? process.env.CLOUDINARY_UPLOAD_FOLDER ?? "judith-aiyesan",
    resourceType,
  });

  return {
    bytes: result.bytes,
    format: result.format,
    height: result.height,
    publicId: result.public_id,
    resourceType: result.resource_type as StoredMedia["resourceType"],
    url: result.secure_url,
    width: result.width,
  };
}
