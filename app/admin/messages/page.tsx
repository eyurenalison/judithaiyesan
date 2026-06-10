import { getPrisma } from "../../lib/db";
import { deleteMessage, markMessageRead } from "../actions";
import { AdminForm } from "../admin-form";
import { AdminShell } from "../admin-shell";
import { requireAdmin } from "../guard";

export default async function AdminMessagesPage() {
  await requireAdmin();
  const messages = await getPrisma().contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      description="Read and manage contact form submissions."
      title="Messages"
    >
      <div className="admin-list">
        {messages.map((message) => (
          <article className="admin-item message-item" key={message.id}>
            <div>
              <p className="card-kicker">{message.read ? "Read" : "Unread"}</p>
              <h2>{message.subject || "No subject"}</h2>
              <p>
                <strong>{message.name}</strong> · {message.email}
              </p>
              <p>{message.message}</p>
              <small>{message.createdAt.toLocaleString()}</small>
            </div>
            <div className="inline-form">
              {!message.read ? (
                <AdminForm
                  action={markMessageRead}
                  successMessage="Message marked as read."
                >
                  <input name="id" type="hidden" value={message.id} />
                  <button className="secondary-button" type="submit">
                    Mark Read
                  </button>
                </AdminForm>
              ) : null}
              <AdminForm
                action={deleteMessage}
                successMessage="Message deleted."
              >
                <input name="id" type="hidden" value={message.id} />
                <button className="danger-button" type="submit">
                  Delete
                </button>
              </AdminForm>
            </div>
          </article>
        ))}
      </div>
    </AdminShell>
  );
}
