import { getPrisma } from "../../lib/db";
import { deleteMedia } from "../actions";
import { AdminForm } from "../admin-form";
import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../guard";
import { MediaUploader } from "./media-uploader";

export default async function AdminMediaPage() {
  await requireAdmin();
  const media = await getPrisma().media.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      description="Upload, preview, and manage images, audio, and videos."
      title="Media"
    >
      <MediaUploader />
      <div className="media-admin-grid">
        {media.map((item) => (
          <article className="media-admin-card" key={item.id}>
            {item.type === "image" ? (
              <img alt={item.altText ?? ""} src={item.url} />
            ) : (
              <a href={item.url}>Open {item.type}</a>
            )}
            <p>{item.filename ?? item.url}</p>
            <code>{item.url}</code>
            <AdminForm action={deleteMedia} successMessage="Media deleted.">
              <input name="id" type="hidden" value={item.id} />
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
