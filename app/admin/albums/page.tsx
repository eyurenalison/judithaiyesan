import { getPrisma } from "../../lib/db";
import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../guard";
import { AlbumsClient } from "./albums-client";

export default async function AdminAlbumsPage() {
  await requireAdmin();
  const albums = await getPrisma().album.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <AdminShell
      description="Manage music releases, audio preview files, streaming links, and publication status."
      title="Albums"
    >
      <AlbumsClient initialAlbums={albums} />
    </AdminShell>
  );
}
