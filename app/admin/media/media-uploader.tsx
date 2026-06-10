"use client";

import { useState } from "react";
import { useToast } from "../../components/toast";

export function MediaUploader() {
  const [previewUrl, setPreviewUrl] = useState<string>();
  const { showToast } = useToast();

  async function handleSubmit(formData: FormData) {
    showToast("Uploading...", "info");
    const response = await fetch("/api/admin/media", {
      body: formData,
      method: "POST",
    });
    const result = await response.json();

    if (!response.ok) {
      showToast(result.error ?? "Upload failed.", "error");
      return;
    }

    setPreviewUrl(result.url);
    showToast("Uploaded successfully! Refreshing...", "success");
    window.location.reload();
  }

  return (
    <form action={handleSubmit} className="admin-form compact">
      <h2>Upload Media</h2>
      <label>
        File
        <input
          accept="image/*,audio/*,video/*"
          name="file"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            setPreviewUrl(file ? URL.createObjectURL(file) : undefined);
          }}
          required
          type="file"
        />
      </label>
      <label>
        Alt text
        <input name="altText" />
      </label>
      <button className="primary-button" type="submit">
        Upload
      </button>
      {previewUrl ? <a href={previewUrl}>Preview selected media</a> : null}
    </form>
  );
}
