import { getPrisma } from "../../lib/db";
import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../guard";
import { LyricsClient } from "./lyrics-client";

export default async function AdminLyricsPage() {
  await requireAdmin();
  const lyrics = await getPrisma().lyric.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      description="Manage song lyrics, summaries, verse formatting, and publishing status."
      title="Lyrics"
    >
      <LyricsClient initialLyrics={lyrics} />
    </AdminShell>
  );
}
