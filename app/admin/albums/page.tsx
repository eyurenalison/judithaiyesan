import { getPrisma } from "../../lib/db";
import { createAlbum, deleteAlbum, updateAlbum } from "../actions";
import { AdminForm } from "../admin-form";
import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../guard";
import { ImageUploadInput } from "../image-upload-input";

export default async function AdminAlbumsPage() {
  await requireAdmin();
  const albums = await getPrisma().album.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <AdminShell
      description="Manage album cards, audio files, download links, publishing, and order."
      title="Albums"
    >
      <AdminForm
        action={createAlbum}
        className="admin-form compact"
        resetOnSuccess
        successMessage="Album created successfully!"
      >
        <h2>New Album</h2>
        <label>
          Title
          <input name="title" required />
        </label>
        <label>
          Subtitle
          <input name="subtitle" />
        </label>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput renders input natively */}
        <label>
          Cover image URL
          <ImageUploadInput name="coverImageSrc" required />
        </label>
        <label>
          Audio file URL
          <input name="audioFileSrc" />
        </label>
        <label>
          Listen URL
          <input name="externalListenUrl" />
        </label>
        <label>
          Download URL
          <input name="downloadFileSrc" />
        </label>
        <label>
          Order
          <input name="order" type="number" defaultValue="0" />
        </label>
        <label className="checkbox-row">
          <input name="featured" type="checkbox" /> Featured
        </label>
        <label className="checkbox-row">
          <input name="published" type="checkbox" defaultChecked /> Published
        </label>
        <button className="primary-button" type="submit">
          Create Album
        </button>
      </AdminForm>

      <div className="admin-list">
        {albums.map((album) => (
          <article className="admin-item" key={album.id}>
            <AdminForm
              action={updateAlbum}
              className="admin-form compact"
              successMessage="Album saved successfully!"
            >
              <input name="id" type="hidden" value={album.id} />
              <label>
                Title
                <input name="title" required defaultValue={album.title} />
              </label>
              <label>
                Subtitle
                <input name="subtitle" defaultValue={album.subtitle ?? ""} />
              </label>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput renders input natively */}
              <label>
                Cover image URL
                <ImageUploadInput
                  name="coverImageSrc"
                  required
                  defaultValue={album.coverImageSrc}
                />
              </label>
              <label>
                Audio file URL
                <input
                  name="audioFileSrc"
                  defaultValue={album.audioFileSrc ?? ""}
                />
              </label>
              <label>
                Listen URL
                <input
                  name="externalListenUrl"
                  defaultValue={album.externalListenUrl ?? ""}
                />
              </label>
              <label>
                Download URL
                <input
                  name="downloadFileSrc"
                  defaultValue={album.downloadFileSrc ?? ""}
                />
              </label>
              <label>
                Order
                <input name="order" type="number" defaultValue={album.order} />
              </label>
              <label className="checkbox-row">
                <input
                  name="featured"
                  type="checkbox"
                  defaultChecked={album.featured}
                />{" "}
                Featured
              </label>
              <label className="checkbox-row">
                <input
                  name="published"
                  type="checkbox"
                  defaultChecked={album.published}
                />{" "}
                Published
              </label>
              <button className="primary-button" type="submit">
                Save Album
              </button>
            </AdminForm>
            <AdminForm action={deleteAlbum} successMessage="Album deleted.">
              <input name="id" type="hidden" value={album.id} />
              <button className="danger-button" type="submit">
                Delete
              </button>
            </AdminForm>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
