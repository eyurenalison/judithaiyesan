import { getPrisma } from "../lib/db";
import { AdminShell } from "./admin-shell";
import { requireAdmin } from "./guard";

export default async function AdminPage() {
  await requireAdmin();
  const prisma = getPrisma();
  const [slides, albums, lyrics, events, media, messages] = await Promise.all([
    prisma.heroSlide.count(),
    prisma.album.count(),
    prisma.lyric.count(),
    prisma.event.count(),
    prisma.media.count(),
    prisma.contactMessage.count({ where: { read: false } }),
  ]);

  return (
    <AdminShell
      description="Manage content, media, messages, and publishing status."
      title="Dashboard"
    >
      <div className="admin-stat-grid">
        <div className="admin-stat">
          <span>{slides}</span>
          <p>Hero slides</p>
        </div>
        <div className="admin-stat">
          <span>{albums}</span>
          <p>Albums</p>
        </div>
        <div className="admin-stat">
          <span>{lyrics}</span>
          <p>Lyrics</p>
        </div>
        <div className="admin-stat">
          <span>{events}</span>
          <p>Events</p>
        </div>
        <div className="admin-stat">
          <span>{media}</span>
          <p>Media files</p>
        </div>
        <div className="admin-stat">
          <span>{messages}</span>
          <p>Unread messages</p>
        </div>
      </div>
    </AdminShell>
  );
}
