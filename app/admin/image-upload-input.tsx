"use client";

import { type ChangeEvent, useRef, useState } from "react";
import { useToast } from "../components/toast";

type ImageUploadInputProps = {
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

export function ImageUploadInput({
  name,
  defaultValue = "",
  required = false,
  placeholder = "https://example.com/image.jpg",
  className,
}: ImageUploadInputProps) {
  const [value, setValue] = useState(defaultValue);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file.", "error");
      return;
    }

    setIsUploading(true);
    showToast("Uploading image...", "info");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("altText", `Uploaded ${file.name}`);

      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to upload image");
      }

      setValue(data.url);
      showToast("Image uploaded successfully!", "success");
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "Upload failed.";
      showToast(message, "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`image-upload-wrapper ${className ?? ""}`.trim()}>
      <div className="image-upload-field-row">
        <input
          className="image-upload-text-input"
          name={name}
          onChange={handleTextChange}
          placeholder={placeholder}
          required={required}
          type="text"
          value={value}
        />
        <button
          className="secondary-button image-upload-btn"
          disabled={isUploading}
          onClick={triggerFileSelect}
          type="button"
        >
          {isUploading ? "..." : "Upload"}
        </button>
        <input
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ display: "none" }}
          type="file"
        />
      </div>
      {value ? (
        <div className="image-upload-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Preview"
            className="image-upload-preview-thumb"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            onLoad={(e) => {
              e.currentTarget.style.display = "block";
            }}
            src={value}
          />
        </div>
      ) : null}
    </div>
  );
}
