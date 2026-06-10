export type MediaResourceType = "image" | "video" | "raw" | "auto";

export type StoredMedia = {
  url: string;
  publicId: string;
  resourceType: MediaResourceType;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
};

export type UploadMediaInput = {
  file: File;
  folder?: string;
  resourceType?: MediaResourceType;
};
