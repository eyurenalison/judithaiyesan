import { getPrisma } from "../../lib/db";
import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../guard";
import { MessagesClient } from "./messages-client";

export default async function AdminMessagesPage() {
  await requireAdmin();
  const messages = await getPrisma().contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      description="View, search, filter, and respond to incoming contact submissions."
      title="Messages"
    >
      <MessagesClient initialMessages={messages} />
    </AdminShell>
  );
}
