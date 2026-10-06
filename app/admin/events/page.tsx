import { getPrisma } from "../../lib/db";
import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../guard";
import { EventsClient } from "./events-client";

export default async function AdminEventsPage() {
  await requireAdmin();
  const prisma = getPrisma();
  const [events, media] = await Promise.all([
    prisma.event.findMany({
      include: {
        galleryItems: {
          include: { media: true },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { date: "desc" },
    }),
    prisma.media.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <AdminShell
      description="Schedule live worship concerts, conferences, venue details, and event photo galleries."
      title="Events"
    >
      <EventsClient initialEvents={events} mediaList={media} />
    </AdminShell>
  );
}
