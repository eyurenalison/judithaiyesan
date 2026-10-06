"use client";

import { useMemo, useState } from "react";
import { useToast } from "../../components/toast";
import {
  createLyric,
  deleteLyric,
  deleteLyricsBulk,
  updateLyric,
} from "../actions";
import { AdminForm } from "../admin-form";
import { BulkActionsBar } from "../components/bulk-actions-bar";
import { ConfirmDialog } from "../components/confirm-dialog";
import {
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconLyrics,
  IconPlus,
  IconSearch,
  IconTrash,
} from "../components/icons";
import { TableActionsMenu } from "../components/table-actions-menu";
import { ImageUploadInput } from "../image-upload-input";

type LyricItem = {
  id: string;
  songTitle: string;
  body: string;
  summary: string | null;
  coverSrc: string | null;
  published: boolean;
  createdAt: Date;
};

export function LyricsClient({
  initialLyrics,
}: {
  initialLyrics: LyricItem[];
}) {
  const { showToast } = useToast();
  const [lyrics, setLyrics] = useState<LyricItem[]>(initialLyrics);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLyric, setEditingLyric] = useState<LyricItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LyricItem | null>(null);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    try {
      const fd = new FormData();
      fd.set("id", targetId);
      await deleteLyric(fd);
      setLyrics((prev) => prev.filter((l) => l.id !== targetId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
      showToast("Song lyrics deleted successfully.", "success");
    } catch {
      showToast("Failed to delete lyrics.", "error");
    }
  }

  const PAGE_SIZE = 8;

  const filtered = useMemo(() => {
    return lyrics.filter((l) => {
      if (filter === "published" && !l.published) return false;
      if (filter === "draft" && l.published) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          l.songTitle.toLowerCase().includes(q) ||
          (l.summary ?? "").toLowerCase().includes(q) ||
          l.body.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [lyrics, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const isAllCurrentPageSelected =
    paginated.length > 0 && paginated.every((l) => selectedIds.has(l.id));

  function toggleSelectAllCurrentPage() {
    if (isAllCurrentPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const l of paginated) {
          next.delete(l.id);
        }
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const l of paginated) {
          next.add(l.id);
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
      await deleteLyricsBulk(fd);
      setLyrics((prev) => prev.filter((l) => !selectedIds.has(l.id)));
      setSelectedIds(new Set());
      showToast(
        `${count} song lyric${count > 1 ? "s" : ""} deleted successfully.`,
        "success",
      );
    } catch {
      showToast("Failed to delete selected lyrics.", "error");
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
            All <span className="tab-count">{lyrics.length}</span>
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
              placeholder="Search lyrics by song or word..."
              type="text"
              value={search}
            />
          </div>
          <button
            className="admin-primary-btn"
            onClick={() => setIsCreateOpen(true)}
            type="button"
          >
            <IconPlus /> Add Song Lyrics
          </button>
        </div>
      </div>

      {/* Lyrics Table */}
      {filtered.length === 0 ? (
        <div className="admin-empty-card">
          <span className="admin-empty-icon">
            <IconLyrics />
          </span>
          <h3>No song lyrics found</h3>
          <p>
            {search
              ? "No songs match your search keyword."
              : "Publish your first song lyrics and chord sheets."}
          </p>
          <button
            className="admin-primary-btn"
            onClick={() => setIsCreateOpen(true)}
            type="button"
          >
            <IconPlus /> Add Song Lyrics
          </button>
        </div>
      ) : (
        <>
          <BulkActionsBar
            itemLabel="song lyric"
            onClearSelection={() => setSelectedIds(new Set())}
            onDeleteSelected={handleBulkDelete}
            selectedCount={selectedIds.size}
            totalCount={lyrics.length}
          />

          <div className="admin-card-section no-padding">
            <div className="admin-table-wrapper">
              <table className="admin-modern-table">
                <thead>
                  <tr>
                    <th className="admin-table-checkbox-th">
                      <input
                        aria-label="Select all lyrics on page"
                        checked={isAllCurrentPageSelected}
                        className="admin-table-checkbox"
                        onChange={toggleSelectAllCurrentPage}
                        type="checkbox"
                      />
                    </th>
                    <th>Song Title</th>
                    <th>Summary</th>
                    <th>Length</th>
                    <th>Status</th>
                    <th className="align-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((lyric) => (
                    <tr
                      className={
                        selectedIds.has(lyric.id) ? "admin-row-selected" : ""
                      }
                      key={lyric.id}
                    >
                      <td className="admin-table-checkbox-td">
                        <input
                          aria-label={`Select lyric for ${lyric.songTitle}`}
                          checked={selectedIds.has(lyric.id)}
                          className="admin-table-checkbox"
                          onChange={() => toggleSelect(lyric.id)}
                          type="checkbox"
                        />
                      </td>
                      <td>
                        <div className="admin-table-main-info">
                          <strong className="title">{lyric.songTitle}</strong>
                          {lyric.coverSrc && (
                            <span className="cover-indicator">
                              📷 Has artwork
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <p className="admin-table-summary-snip">
                          {lyric.summary || `${lyric.body.slice(0, 80)}...`}
                        </p>
                      </td>
                      <td>
                        <span className="admin-count-badge">
                          {lyric.body.split("\n").filter(Boolean).length} lines
                        </span>
                      </td>
                      <td>
                        <span
                          className={`admin-status-pill ${lyric.published ? "published" : "draft"}`}
                        >
                          {lyric.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="align-right">
                        <TableActionsMenu
                          items={[
                            {
                              label: "Edit Lyrics",
                              onClick: () => setEditingLyric(lyric),
                            },
                            {
                              label: "Delete Lyrics",
                              icon: <IconTrash />,
                              variant: "danger",
                              onClick: () => {
                                setDeleteTarget(lyric);
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
                  {filtered.length} songs
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

      {/* Create Modal */}
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
                <h3 className="admin-modal-title">Add Song Lyrics</h3>
                <p className="admin-modal-subtitle">
                  Publish full lyrics and song notes
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
                await createLyric(fd);
                setIsCreateOpen(false);
                window.location.reload();
              }}
              className="admin-modal-form"
              resetOnSuccess
              successMessage="Lyrics created successfully!"
            >
              <label className="admin-form-label">
                <span>Song Title *</span>
                <input
                  name="songTitle"
                  placeholder="e.g. My Redeemer Lives"
                  required
                  type="text"
                />
              </label>

              <label className="admin-form-label">
                <span>Summary / Key Notes</span>
                <textarea
                  name="summary"
                  placeholder="Key of G Major · Moderate Tempo · Album: Glory In The Highest"
                  rows={2}
                />
              </label>

              {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput handles control */}
              <label className="admin-form-label">
                <span>Cover / Single Artwork URL (optional)</span>
                <ImageUploadInput name="coverSrc" />
              </label>

              <label className="admin-form-label">
                <span>Full Lyrics Body *</span>
                <textarea
                  name="body"
                  placeholder="[Verse 1]&#10;Your grace has found me...&#10;&#10;[Chorus]&#10;Hallelujah..."
                  required
                  rows={10}
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
                  Save Lyrics
                </button>
              </div>
            </AdminForm>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingLyric && (
        <div className="admin-modal-backdrop">
          <button
            aria-label="Close dialog"
            className="admin-modal-backdrop-btn"
            onClick={() => setEditingLyric(null)}
            type="button"
          />
          <div className="admin-modal-card large" role="dialog">
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">Edit Song Lyrics</h3>
                <p className="admin-modal-subtitle">
                  Update lines, key details, or publishing
                </p>
              </div>
              <button
                aria-label="Close dialog"
                className="admin-modal-close-btn"
                onClick={() => setEditingLyric(null)}
                type="button"
              >
                <IconClose />
              </button>
            </div>

            <AdminForm
              action={async (fd) => {
                await updateLyric(fd);
                setEditingLyric(null);
                window.location.reload();
              }}
              className="admin-modal-form"
              successMessage="Lyrics updated successfully!"
            >
              <input name="id" type="hidden" value={editingLyric.id} />

              <label className="admin-form-label">
                <span>Song Title *</span>
                <input
                  defaultValue={editingLyric.songTitle}
                  name="songTitle"
                  required
                  type="text"
                />
              </label>

              <label className="admin-form-label">
                <span>Summary / Key Notes</span>
                <textarea
                  defaultValue={editingLyric.summary ?? ""}
                  name="summary"
                  rows={2}
                />
              </label>

              {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput handles control */}
              <label className="admin-form-label">
                <span>Cover / Single Artwork URL (optional)</span>
                <ImageUploadInput
                  defaultValue={editingLyric.coverSrc ?? ""}
                  name="coverSrc"
                />
              </label>

              <label className="admin-form-label">
                <span>Full Lyrics Body *</span>
                <textarea
                  defaultValue={editingLyric.body}
                  name="body"
                  required
                  rows={10}
                />
              </label>

              <div className="admin-form-footer-row">
                <label className="admin-checkbox-label">
                  <input
                    defaultChecked={editingLyric.published}
                    name="published"
                    type="checkbox"
                  />
                  <span>Publish to live site</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => setEditingLyric(null)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  Update Lyrics
                </button>
              </div>
            </AdminForm>
          </div>
        </div>
      )}

      <ConfirmDialog
        confirmText="Delete Lyrics"
        isOpen={Boolean(deleteTarget)}
        message={`Are you sure you want to permanently delete lyrics for "${deleteTarget?.songTitle || ""}"? This action cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Song Lyrics"
        variant="danger"
      />
    </div>
  );
}
