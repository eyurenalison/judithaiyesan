"use client";

import { useMemo, useState } from "react";
import { useToast } from "../../components/toast";
import {
  attachGalleryItem,
  createEvent,
  deleteEvent,
  deleteEventsBulk,
  removeGalleryItem,
  updateEvent,
} from "../actions";
import { AdminForm } from "../admin-form";
import { BulkActionsBar } from "../components/bulk-actions-bar";
import { ConfirmDialog } from "../components/confirm-dialog";
import {
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconEvents,
  IconMedia,
  IconPlus,
  IconSearch,
  IconTrash,
} from "../components/icons";
import { TableActionsMenu } from "../components/table-actions-menu";
import { ImageUploadInput } from "../image-upload-input";

type MediaItem = {
  id: string;
  url: string;
  type: string;
  filename: string | null;
};

type GalleryItemType = {
  id: string;
  order: number;
  caption: string | null;
  media: MediaItem;
};

type EventItem = {
  id: string;
  title: string;
  date: Date;
  displayDate: string;
  location: string;
  description: string;
  coverImageSrc: string;
  status: string;
  published: boolean;
  galleryItems: GalleryItemType[];
};

function toDateInput(date: Date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
}

export function EventsClient({
  initialEvents,
  mediaList,
}: {
  initialEvents: EventItem[];
  mediaList: MediaItem[];
}) {
  const { showToast } = useToast();
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [managingGalleryEvent, setManagingGalleryEvent] =
    useState<EventItem | null>(null);

  const PAGE_SIZE = 6;

  const filtered = useMemo(() => {
    return events.filter((ev) => {
      if (filter === "published" && !ev.published) return false;
      if (filter === "draft" && ev.published) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          ev.title.toLowerCase().includes(q) ||
          ev.location.toLowerCase().includes(q) ||
          ev.displayDate.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [events, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isAllCurrentPageSelected =
    paginated.length > 0 && paginated.every((ev) => selectedIds.has(ev.id));

  function toggleSelectAllCurrentPage() {
    if (isAllCurrentPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const ev of paginated) {
          next.delete(ev.id);
        }
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const ev of paginated) {
          next.add(ev.id);
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

  async function handleBulkDelete() {
    const count = selectedIds.size;
    try {
      const fd = new FormData();
      fd.set("ids", JSON.stringify(Array.from(selectedIds)));
      await deleteEventsBulk(fd);
      setEvents((prev) => prev.filter((ev) => !selectedIds.has(ev.id)));
      setSelectedIds(new Set());
      showToast(
        `${count} event${count > 1 ? "s" : ""} deleted successfully.`,
        "success",
      );
    } catch {
      showToast("Failed to delete selected events.", "error");
    }
  }

  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    try {
      const fd = new FormData();
      fd.set("id", targetId);
      await deleteEvent(fd);
      setEvents((prev) => prev.filter((item) => item.id !== targetId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
      showToast("Event deleted successfully.", "success");
    } catch {
      showToast("Failed to delete event.", "error");
    }
  }

  return (
    <div className="admin-content-stack">
      {/* Controls Bar */}
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
            All <span className="tab-count">{events.length}</span>
          </button>
          <button
            className={`admin-filter-tab ${filter === "published" ? "active" : ""}`}
            onClick={() => {
              setFilter("published");
              setPage(1);
            }}
            type="button"
          >
            Published
          </button>
          <button
            className={`admin-filter-tab ${filter === "draft" ? "active" : ""}`}
            onClick={() => {
              setFilter("draft");
              setPage(1);
            }}
            type="button"
          >
            Draft
          </button>
        </div>

        <div className="admin-controls-right">
          <div className="admin-search-box">
            <IconSearch />
            <input
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title or location..."
              type="text"
              value={search}
            />
          </div>
          <button
            className="admin-primary-btn"
            onClick={() => setIsCreateOpen(true)}
            type="button"
          >
            <IconPlus /> Create Event
          </button>
        </div>
      </div>

      {/* Events Table */}
      {filtered.length === 0 ? (
        <div className="admin-empty-card">
          <span className="admin-empty-icon">
            <IconEvents />
          </span>
          <h3>No events found</h3>
          <p>
            {search
              ? "No events match your search."
              : "Get started by adding upcoming ministry concerts or programs."}
          </p>
          <button
            className="admin-primary-btn"
            onClick={() => setIsCreateOpen(true)}
            type="button"
          >
            <IconPlus /> Create Event
          </button>
        </div>
      ) : (
        <>
          <BulkActionsBar
            itemLabel="event"
            onClearSelection={() => setSelectedIds(new Set())}
            onDeleteSelected={handleBulkDelete}
            selectedCount={selectedIds.size}
            totalCount={events.length}
          />

          <div className="admin-card-section no-padding">
            <div className="admin-table-wrapper">
              <table className="admin-modern-table">
                <thead>
                  <tr>
                    <th className="admin-table-checkbox-th">
                      <input
                        aria-label="Select all events on page"
                        checked={isAllCurrentPageSelected}
                        className="admin-table-checkbox"
                        onChange={toggleSelectAllCurrentPage}
                        type="checkbox"
                      />
                    </th>
                    <th>Event Date</th>
                    <th>Cover</th>
                    <th>Title & Location</th>
                    <th>Status</th>
                    <th>Gallery</th>
                    <th>Publish</th>
                    <th className="align-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((ev) => (
                    <tr
                      className={
                        selectedIds.has(ev.id) ? "admin-row-selected" : ""
                      }
                      key={ev.id}
                    >
                      <td className="admin-table-checkbox-td">
                        <input
                          aria-label={`Select event ${ev.title}`}
                          checked={selectedIds.has(ev.id)}
                          className="admin-table-checkbox"
                          onChange={() => toggleSelect(ev.id)}
                          type="checkbox"
                        />
                      </td>
                      <td>
                        <div className="admin-event-date-box">
                          <span className="month">
                            {new Date(ev.date).toLocaleDateString(undefined, {
                              month: "short",
                            })}
                          </span>
                          <span className="day">
                            {new Date(ev.date).getDate()}
                          </span>
                          <span className="year">
                            {new Date(ev.date).getFullYear()}
                          </span>
                        </div>
                      </td>
                      <td className="thumbnail-cell">
                        <div className="admin-table-thumbnail-wrap">
                          <img
                            alt={ev.title}
                            className="admin-table-thumbnail"
                            src={
                              ev.coverImageSrc || "/images/core-img/favicon.png"
                            }
                          />
                        </div>
                      </td>
                      <td>
                        <div className="admin-table-main-info">
                          <strong className="title">{ev.title}</strong>
                          <span className="subtitle">📍 {ev.location}</span>
                          <small className="date-caption">
                            {ev.displayDate}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className="admin-status-pill neutral">
                          {ev.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="admin-gallery-chip-btn"
                          onClick={() => setManagingGalleryEvent(ev)}
                          type="button"
                        >
                          <IconMedia /> {ev.galleryItems.length} photos
                        </button>
                      </td>
                      <td>
                        <span
                          className={`admin-status-pill ${ev.published ? "published" : "draft"}`}
                        >
                          {ev.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="align-right">
                        <TableActionsMenu
                          items={[
                            {
                              label: "Edit Event",
                              onClick: () => setEditingEvent(ev),
                            },
                            {
                              label: `Manage Gallery (${ev.galleryItems.length})`,
                              icon: <IconMedia />,
                              onClick: () => setManagingGalleryEvent(ev),
                            },
                            {
                              label: "Delete Event",
                              icon: <IconTrash />,
                              variant: "danger",
                              onClick: () => {
                                setDeleteTarget(ev);
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="admin-pagination-bar">
                <span className="admin-pagination-text">
                  Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length} events
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

      {/* Create Event Modal */}
      {isCreateOpen && (
        <div className="admin-modal-backdrop">
          <button
            aria-label="Close dialog"
            className="admin-modal-backdrop-btn"
            onClick={() => setIsCreateOpen(false)}
            type="button"
          />
          <div className="admin-modal-card large" role="dialog">
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">Create New Event</h3>
                <p className="admin-modal-subtitle">
                  Add a concert, ministry meeting or tour date
                </p>
              </div>
              <button
                aria-label="Close dialog"
                className="admin-modal-close-btn"
                onClick={() => setIsCreateOpen(false)}
                type="button"
              >
                <IconClose />
              </button>
            </div>

            <AdminForm
              action={async (fd) => {
                await createEvent(fd);
                setIsCreateOpen(false);
                window.location.reload();
              }}
              className="admin-modal-form"
              resetOnSuccess
              successMessage="Event created successfully!"
            >
              <div className="admin-form-grid-2">
                <label className="admin-form-label">
                  <span>Event Title *</span>
                  <input
                    name="title"
                    placeholder="e.g. Night of Worship"
                    required
                    type="text"
                  />
                </label>
                <label className="admin-form-label">
                  <span>Status Pill *</span>
                  <input
                    defaultValue="Upcoming"
                    name="status"
                    required
                    type="text"
                  />
                </label>
              </div>

              <div className="admin-form-grid-2">
                <label className="admin-form-label">
                  <span>Event Date & Time *</span>
                  <input name="date" required type="datetime-local" />
                </label>
                <label className="admin-form-label">
                  <span>Display Date String *</span>
                  <input
                    name="displayDate"
                    placeholder="e.g. Saturday, October 24, 2026 · 6:00 PM"
                    required
                    type="text"
                  />
                </label>
              </div>

              <label className="admin-form-label">
                <span>Location / Venue *</span>
                <input
                  name="location"
                  placeholder="e.g. Eko Convention Centre, Victoria Island, Lagos"
                  required
                  type="text"
                />
              </label>

              {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput handles control */}
              <label className="admin-form-label">
                <span>Event Cover Image *</span>
                <ImageUploadInput name="coverImageSrc" required />
              </label>

              <label className="admin-form-label">
                <span>Description</span>
                <textarea
                  name="description"
                  placeholder="Detailed description of the event..."
                  rows={3}
                />
              </label>

              <div className="admin-form-footer-row">
                <label className="admin-checkbox-label">
                  <input defaultChecked name="published" type="checkbox" />
                  <span>Publish to live site</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => setIsCreateOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  Save Event
                </button>
              </div>
            </AdminForm>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="admin-modal-backdrop">
          <button
            aria-label="Close dialog"
            className="admin-modal-backdrop-btn"
            onClick={() => setEditingEvent(null)}
            type="button"
          />
          <div className="admin-modal-card large" role="dialog">
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">Edit Event</h3>
                <p className="admin-modal-subtitle">
                  Modify date, venue, or description
                </p>
              </div>
              <button
                aria-label="Close dialog"
                className="admin-modal-close-btn"
                onClick={() => setEditingEvent(null)}
                type="button"
              >
                <IconClose />
              </button>
            </div>

            <AdminForm
              action={async (fd) => {
                await updateEvent(fd);
                setEditingEvent(null);
                window.location.reload();
              }}
              className="admin-modal-form"
              successMessage="Event updated successfully!"
            >
              <input name="id" type="hidden" value={editingEvent.id} />
              <div className="admin-form-grid-2">
                <label className="admin-form-label">
                  <span>Event Title *</span>
                  <input
                    defaultValue={editingEvent.title}
                    name="title"
                    required
                    type="text"
                  />
                </label>
                <label className="admin-form-label">
                  <span>Status Pill *</span>
                  <input
                    defaultValue={editingEvent.status}
                    name="status"
                    required
                    type="text"
                  />
                </label>
              </div>

              <div className="admin-form-grid-2">
                <label className="admin-form-label">
                  <span>Event Date & Time *</span>
                  <input
                    defaultValue={toDateInput(editingEvent.date)}
                    name="date"
                    required
                    type="datetime-local"
                  />
                </label>
                <label className="admin-form-label">
                  <span>Display Date String *</span>
                  <input
                    defaultValue={editingEvent.displayDate}
                    name="displayDate"
                    required
                    type="text"
                  />
                </label>
              </div>

              <label className="admin-form-label">
                <span>Location / Venue *</span>
                <input
                  defaultValue={editingEvent.location}
                  name="location"
                  required
                  type="text"
                />
              </label>

              {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput handles control */}
              <label className="admin-form-label">
                <span>Event Cover Image *</span>
                <ImageUploadInput
                  defaultValue={editingEvent.coverImageSrc}
                  name="coverImageSrc"
                  required
                />
              </label>

              <label className="admin-form-label">
                <span>Description</span>
                <textarea
                  defaultValue={editingEvent.description}
                  name="description"
                  rows={3}
                />
              </label>

              <div className="admin-form-footer-row">
                <label className="admin-checkbox-label">
                  <input
                    defaultChecked={editingEvent.published}
                    name="published"
                    type="checkbox"
                  />
                  <span>Publish to live site</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => setEditingEvent(null)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  Update Event
                </button>
              </div>
            </AdminForm>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {managingGalleryEvent && (
        <div className="admin-modal-backdrop">
          <button
            aria-label="Close dialog"
            className="admin-modal-backdrop-btn"
            onClick={() => setManagingGalleryEvent(null)}
            type="button"
          />
          <div className="admin-modal-card large" role="dialog">
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">
                  Event Gallery: {managingGalleryEvent.title}
                </h3>
                <p className="admin-modal-subtitle">
                  {managingGalleryEvent.galleryItems.length} photos currently
                  attached
                </p>
              </div>
              <button
                aria-label="Close dialog"
                className="admin-modal-close-btn"
                onClick={() => setManagingGalleryEvent(null)}
                type="button"
              >
                <IconClose />
              </button>
            </div>

            {/* Existing Gallery Photos */}
            <div className="admin-gallery-modal-body">
              {managingGalleryEvent.galleryItems.length === 0 ? (
                <div className="admin-empty-state-mini">
                  <IconMedia />
                  <p>No photos attached to this event yet.</p>
                </div>
              ) : (
                <div className="admin-gallery-modal-grid">
                  {managingGalleryEvent.galleryItems.map((gi) => (
                    <div className="admin-gallery-modal-item" key={gi.id}>
                      <img
                        alt={gi.caption ?? "Gallery photo"}
                        src={gi.media.url}
                      />
                      <div className="caption-bar">
                        <span>{gi.caption || `Order: ${gi.order}`}</span>
                        <AdminForm
                          action={async (fd) => {
                            await removeGalleryItem(fd);
                            window.location.reload();
                          }}
                          successMessage="Removed photo"
                        >
                          <input name="id" type="hidden" value={gi.id} />
                          <button
                            aria-label="Remove photo"
                            className="remove-btn"
                            type="submit"
                          >
                            <IconTrash />
                          </button>
                        </AdminForm>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Attach New Photo Section */}
              <div className="admin-attach-media-box">
                <h4>Attach Media to Gallery</h4>
                <AdminForm
                  action={async (fd) => {
                    await attachGalleryItem(fd);
                    window.location.reload();
                  }}
                  className="admin-attach-media-form"
                  resetOnSuccess
                  successMessage="Photo attached to gallery!"
                >
                  <input
                    name="eventId"
                    type="hidden"
                    value={managingGalleryEvent.id}
                  />
                  <div className="admin-form-grid-3">
                    <label className="admin-form-label">
                      <span>Select Media File</span>
                      <select name="mediaId" required>
                        <option value="">Choose media...</option>
                        {mediaList.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.filename || m.url.split("/").pop() || m.id}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="admin-form-label">
                      <span>Caption (optional)</span>
                      <input
                        name="caption"
                        placeholder="Stage photo..."
                        type="text"
                      />
                    </label>
                    <label className="admin-form-label inline-num">
                      <span>Order</span>
                      <input defaultValue="0" name="order" type="number" />
                    </label>
                  </div>
                  <button className="primary-button inline" type="submit">
                    Attach Selected Media
                  </button>
                </AdminForm>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                className="secondary-button"
                onClick={() => setManagingGalleryEvent(null)}
                type="button"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        confirmText="Delete Event"
        isOpen={Boolean(deleteTarget)}
        message={`Are you sure you want to permanently delete the event "${deleteTarget?.title || ""}"? This action cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Event"
        variant="danger"
      />
    </div>
  );
}
