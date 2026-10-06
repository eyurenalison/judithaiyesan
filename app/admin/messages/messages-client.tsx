"use client";

import { useMemo, useState } from "react";
import { useToast } from "../../components/toast";
import { deleteMessage, deleteMessagesBulk, markMessageRead } from "../actions";
import { AdminForm } from "../admin-form";
import { BulkActionsBar } from "../components/bulk-actions-bar";
import { ConfirmDialog } from "../components/confirm-dialog";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconMessages,
  IconSearch,
  IconTrash,
} from "../components/icons";
import { TableActionsMenu } from "../components/table-actions-menu";

type MessageItem = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: Date;
};

export function MessagesClient({
  initialMessages,
}: {
  initialMessages: MessageItem[];
}) {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedMessage, setSelectedMessage] = useState<MessageItem | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<MessageItem | null>(null);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    try {
      const fd = new FormData();
      fd.set("id", targetId);
      await deleteMessage(fd);
      setMessages((prev) => prev.filter((m) => m.id !== targetId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
      if (selectedMessage?.id === targetId) {
        setSelectedMessage(null);
      }
      showToast("Message deleted successfully.", "success");
    } catch {
      showToast("Failed to delete message.", "error");
    }
  }

  async function handleBulkDelete() {
    const count = selectedIds.size;
    try {
      const fd = new FormData();
      fd.set("ids", JSON.stringify(Array.from(selectedIds)));
      await deleteMessagesBulk(fd);
      setMessages((prev) => prev.filter((m) => !selectedIds.has(m.id)));
      setSelectedIds(new Set());
      if (selectedMessage && selectedIds.has(selectedMessage.id)) {
        setSelectedMessage(null);
      }
      showToast(
        `${count} message${count > 1 ? "s" : ""} deleted successfully.`,
        "success",
      );
    } catch {
      showToast("Failed to delete selected messages.", "error");
    }
  }

  const PAGE_SIZE = 8;

  const filteredMessages = useMemo(() => {
    return messages.filter((m) => {
      if (filter === "unread" && m.read) return false;
      if (filter === "read" && !m.read) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesEmail = m.email.toLowerCase().includes(q);
        const matchesSubject = (m.subject ?? "").toLowerCase().includes(q);
        const matchesMsg = m.message.toLowerCase().includes(q);
        return matchesName || matchesEmail || matchesSubject || matchesMsg;
      }
      return true;
    });
  }, [messages, filter, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredMessages.length / PAGE_SIZE),
  );
  const paginatedMessages = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredMessages.slice(start, start + PAGE_SIZE);
  }, [filteredMessages, page]);

  const unreadCount = useMemo(
    () => messages.filter((m) => !m.read).length,
    [messages],
  );
  const readCount = useMemo(
    () => messages.filter((m) => m.read).length,
    [messages],
  );

  const isAllCurrentPageSelected =
    paginatedMessages.length > 0 &&
    paginatedMessages.every((m) => selectedIds.has(m.id));

  function toggleSelectAllCurrentPage() {
    if (isAllCurrentPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const m of paginatedMessages) {
          next.delete(m.id);
        }
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const m of paginatedMessages) {
          next.add(m.id);
        }
        return next;
      });
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="admin-content-stack">
      {/* Controls Bar: Filters, Search & Count */}
      <div className="admin-controls-card">
        <div className="admin-filter-tabs">
          <button
            className={`admin-filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => {
              setFilter("all");
              setPage(1);
            }}
            type="button"
          >
            All <span className="tab-count">{messages.length}</span>
          </button>
          <button
            className={`admin-filter-tab ${filter === "unread" ? "active" : ""}`}
            onClick={() => {
              setFilter("unread");
              setPage(1);
            }}
            type="button"
          >
            Unread <span className="tab-count alert">{unreadCount}</span>
          </button>
          <button
            className={`admin-filter-tab ${filter === "read" ? "active" : ""}`}
            onClick={() => {
              setFilter("read");
              setPage(1);
            }}
            type="button"
          >
            Read <span className="tab-count">{readCount}</span>
          </button>
        </div>

        <div className="admin-search-box">
          <IconSearch />
          <input
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or content..."
            type="text"
            value={search}
          />
          {search && (
            <button
              aria-label="Clear search"
              className="admin-search-clear"
              onClick={() => setSearch("")}
              type="button"
            >
              <IconClose />
            </button>
          )}
        </div>
      </div>

      {/* Messages Data Table */}
      {filteredMessages.length === 0 ? (
        <div className="admin-empty-card">
          <span className="admin-empty-icon">
            <IconMessages />
          </span>
          <h3>No messages found</h3>
          <p>
            {search
              ? "No messages match your search filter."
              : filter === "unread"
                ? "You have answered all messages. Great job!"
                : "No contact submissions yet."}
          </p>
        </div>
      ) : (
        <>
          <BulkActionsBar
            itemLabel="message"
            onClearSelection={() => setSelectedIds(new Set())}
            onDeleteSelected={handleBulkDelete}
            selectedCount={selectedIds.size}
            totalCount={messages.length}
          />

          <div className="admin-card-section no-padding">
            <div className="admin-table-wrapper">
              <table className="admin-modern-table">
                <thead>
                  <tr>
                    <th className="admin-table-checkbox-th">
                      <input
                        aria-label="Select all messages on page"
                        checked={isAllCurrentPageSelected}
                        className="admin-table-checkbox"
                        onChange={toggleSelectAllCurrentPage}
                        type="checkbox"
                      />
                    </th>
                    <th>Status</th>
                    <th>Sender</th>
                    <th>Subject & Preview</th>
                    <th>Received</th>
                    <th className="align-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMessages.map((msg) => (
                    <tr
                      className={`message-row ${!msg.read ? "row-unread" : ""} ${
                        selectedIds.has(msg.id) ? "admin-row-selected" : ""
                      }`}
                      key={msg.id}
                    >
                      <td className="admin-table-checkbox-td">
                        <input
                          aria-label={`Select message from ${msg.name}`}
                          checked={selectedIds.has(msg.id)}
                          className="admin-table-checkbox"
                          onChange={() => toggleSelect(msg.id)}
                          type="checkbox"
                        />
                      </td>
                      <td>
                        <span
                          className={`admin-status-pill ${msg.read ? "read" : "unread"}`}
                        >
                          {msg.read ? "Read" : "Unread"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-table-user">
                          <span className="admin-table-avatar">
                            {msg.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <span className="admin-table-user-name">
                              {msg.name}
                            </span>
                            <a
                              className="admin-table-user-email-link"
                              href={`mailto:${msg.email}`}
                            >
                              {msg.email}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td>
                        <button
                          className="admin-message-preview-button"
                          onClick={() => setSelectedMessage(msg)}
                          type="button"
                        >
                          <strong className="msg-preview-subject">
                            {msg.subject || "(No subject)"}
                          </strong>
                          <span className="msg-preview-body-snip">
                            {msg.message}
                          </span>
                        </button>
                      </td>
                      <td>
                        <span className="admin-table-date">
                          {new Date(msg.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </td>
                      <td className="align-right">
                        <TableActionsMenu
                          items={[
                            {
                              label: "View Message",
                              onClick: () => setSelectedMessage(msg),
                            },
                            ...(!msg.read
                              ? [
                                  {
                                    label: "Mark as Read",
                                    icon: <IconCheck />,
                                    onClick: async () => {
                                      const fd = new FormData();
                                      fd.set("id", msg.id);
                                      await markMessageRead(fd);
                                      setMessages((prev) =>
                                        prev.map((m) =>
                                          m.id === msg.id
                                            ? { ...m, read: true }
                                            : m,
                                        ),
                                      );
                                      showToast(
                                        "Message marked as read.",
                                        "success",
                                      );
                                    },
                                  },
                                ]
                              : []),
                            {
                              label: "Reply via Email",
                              onClick: () => {
                                window.location.href = `mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject || "Message")}`;
                              },
                            },
                            {
                              label: "Delete Message",
                              icon: <IconTrash />,
                              variant: "danger",
                              onClick: () => {
                                setDeleteTarget(msg);
                              },
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="admin-pagination-bar">
                <span className="admin-pagination-text">
                  Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(page * PAGE_SIZE, filteredMessages.length)} of{" "}
                  {filteredMessages.length} messages
                </span>
                <div className="admin-pagination-actions">
                  <button
                    className="admin-pagination-btn"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    type="button"
                  >
                    <IconChevronLeft /> Prev
                  </button>
                  <span className="admin-pagination-current">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    className="admin-pagination-btn"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    type="button"
                  >
                    Next <IconChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Message Reader Modal Dialog */}
      {selectedMessage && (
        <div className="admin-modal-backdrop">
          <button
            aria-label="Close message overlay"
            className="admin-modal-backdrop-btn"
            onClick={() => setSelectedMessage(null)}
            type="button"
          />
          <div className="admin-modal-card" role="dialog">
            <div className="admin-modal-header">
              <div>
                <span
                  className={`admin-status-pill ${selectedMessage.read ? "read" : "unread"}`}
                >
                  {selectedMessage.read ? "Read" : "Unread"}
                </span>
                <h3 className="admin-modal-title">
                  {selectedMessage.subject || "(No Subject)"}
                </h3>
              </div>
              <button
                aria-label="Close message"
                className="admin-modal-close-btn"
                onClick={() => setSelectedMessage(null)}
                type="button"
              >
                <IconClose />
              </button>
            </div>

            <div className="admin-modal-meta">
              <div className="meta-item">
                <span className="meta-label">From:</span>
                <strong className="meta-val">{selectedMessage.name}</strong>
              </div>
              <div className="meta-item">
                <span className="meta-label">Email:</span>
                <a
                  className="meta-link"
                  href={`mailto:${selectedMessage.email}`}
                >
                  {selectedMessage.email}
                </a>
              </div>
              <div className="meta-item">
                <span className="meta-label">Received:</span>
                <span className="meta-val">
                  {new Date(selectedMessage.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="admin-modal-body">
              <p className="admin-modal-message-text">
                {selectedMessage.message}
              </p>
            </div>

            <div className="admin-modal-footer">
              <a
                className="primary-button inline"
                href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject ?? "Inquiry")}`}
              >
                Reply via Email
              </a>
              <div className="admin-modal-footer-right">
                {!selectedMessage.read && (
                  <AdminForm
                    action={async (fd) => {
                      await markMessageRead(fd);
                      setMessages((prev) =>
                        prev.map((m) =>
                          m.id === selectedMessage.id
                            ? { ...m, read: true }
                            : m,
                        ),
                      );
                      setSelectedMessage((prev) =>
                        prev ? { ...prev, read: true } : null,
                      );
                    }}
                    successMessage="Message marked as read"
                  >
                    <input name="id" type="hidden" value={selectedMessage.id} />
                    <button className="secondary-button" type="submit">
                      Mark as Read
                    </button>
                  </AdminForm>
                )}
                <button
                  className="secondary-button"
                  onClick={() => setSelectedMessage(null)}
                  type="button"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        confirmText="Delete Message"
        isOpen={Boolean(deleteTarget)}
        message={`Are you sure you want to permanently delete the message from "${deleteTarget?.name || "this user"}"? This action cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Message"
        variant="danger"
      />
    </div>
  );
}
