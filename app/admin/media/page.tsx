import { getPrisma } from "../../lib/db";
import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../guard";
import { MediaClient } from "./media-client";

export default async function AdminMediaPage() {
  await requireAdmin();
  const media = await getPrisma().media.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      description="Central asset repository for audio files, album covers, banners, and event photographs."
      title="Media Library"
    >
      <MediaClient initialMedia={media} />
    </AdminShell>
  );
}
