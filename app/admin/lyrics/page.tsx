import { getPrisma } from "../../lib/db";
import { createLyric, deleteLyric, updateLyric } from "../actions";
import { AdminForm } from "../admin-form";
import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../guard";
import { ImageUploadInput } from "../image-upload-input";

export default async function AdminLyricsPage() {
  await requireAdmin();
  const lyrics = await getPrisma().lyric.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      description="Create, edit, publish, and unpublish song lyrics."
      title="Lyrics"
    >
      <AdminForm
        action={createLyric}
        className="admin-form compact"
        resetOnSuccess
        successMessage="Lyric created successfully!"
      >
        <h2>New Lyric</h2>
        <label>
          Song title
          <input name="songTitle" required />
        </label>
        <label>
          Summary
          <textarea name="summary" />
        </label>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput renders input natively */}
        <label>
          Cover URL
          <ImageUploadInput name="coverSrc" />
        </label>
        <label>
          Lyrics
          <textarea name="body" required rows={10} />
        </label>
        <label className="checkbox-row">
          <input name="published" type="checkbox" defaultChecked /> Published
        </label>
        <button className="primary-button" type="submit">
          Create Lyric
        </button>
      </AdminForm>

      <div className="admin-list">
        {lyrics.map((lyric) => (
          <article className="admin-item" key={lyric.id}>
            <AdminForm
              action={updateLyric}
              className="admin-form compact"
              successMessage="Lyric saved successfully!"
            >
              <input name="id" type="hidden" value={lyric.id} />
              <label>
                Song title
                <input
                  name="songTitle"
                  required
                  defaultValue={lyric.songTitle}
                />
              </label>
              <label>
                Summary
                <textarea name="summary" defaultValue={lyric.summary ?? ""} />
              </label>
              {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput renders input natively */}
              <label>
                Cover URL
                <ImageUploadInput
                  name="coverSrc"
                  defaultValue={lyric.coverSrc ?? ""}
                />
              </label>
              <label>
                Lyrics
                <textarea
                  name="body"
                  required
                  rows={10}
                  defaultValue={lyric.body}
                />
              </label>
              <label className="checkbox-row">
                <input
                  name="published"
                  type="checkbox"
                  defaultChecked={lyric.published}
                />{" "}
                Published
              </label>
              <button className="primary-button" type="submit">
                Save Lyric
              </button>
            </AdminForm>
            <AdminForm action={deleteLyric} successMessage="Lyric deleted.">
              <input name="id" type="hidden" value={lyric.id} />
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
