"use client";

import { useMemo, useState } from "react";
import { useToast } from "../../components/toast";
import {
  createAlbum,
  deleteAlbum,
  deleteAlbumsBulk,
  updateAlbum,
} from "../actions";
import { AdminForm } from "../admin-form";
import { BulkActionsBar } from "../components/bulk-actions-bar";
import { ConfirmDialog } from "../components/confirm-dialog";
import {
  IconAlbums,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconPlus,
  IconSearch,
  IconTrash,
} from "../components/icons";
import { TableActionsMenu } from "../components/table-actions-menu";
import { ImageUploadInput } from "../image-upload-input";

type AlbumItem = {
  id: string;
  title: string;
  subtitle: string | null;
  coverImageSrc: string;
  audioFileSrc: string | null;
  externalListenUrl: string | null;
  downloadFileSrc: string | null;
  featured: boolean;
  order: number;
  published: boolean;
  createdAt: Date;
};

export function AlbumsClient({
  initialAlbums,
}: {
  initialAlbums: AlbumItem[];
}) {
  const { showToast } = useToast();
  const [albums, setAlbums] = useState<AlbumItem[]>(initialAlbums);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<AlbumItem | null>(null);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    try {
      const fd = new FormData();
      fd.set("id", targetId);
      await deleteAlbum(fd);
      setAlbums((prev) => prev.filter((a) => a.id !== targetId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
      showToast("Album deleted successfully.", "success");
    } catch {
      showToast("Failed to delete album.", "error");
    }
  }
  const [filter, setFilter] = useState<
    "all" | "published" | "draft" | "featured"
  >("all");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<AlbumItem | null>(null);

  const PAGE_SIZE = 6;

  const filtered = useMemo(() => {
    return albums.filter((a) => {
      if (filter === "published" && !a.published) return false;
      if (filter === "draft" && a.published) return false;
      if (filter === "featured" && !a.featured) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          a.title.toLowerCase().includes(q) ||
          (a.subtitle ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [albums, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isAllCurrentPageSelected =
    paginated.length > 0 && paginated.every((a) => selectedIds.has(a.id));

  function toggleSelectAllCurrentPage() {
    if (isAllCurrentPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const a of paginated) {
          next.delete(a.id);
        }
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const a of paginated) {
          next.add(a.id);
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
      await deleteAlbumsBulk(fd);
      setAlbums((prev) => prev.filter((a) => !selectedIds.has(a.id)));
      setSelectedIds(new Set());
      showToast(
        `${count} album${count > 1 ? "s" : ""} deleted successfully.`,
        "success",
      );
    } catch {
      showToast("Failed to delete selected albums.", "error");
    }
  }

  return (
    <div className="admin-content-stack">
      {/* Top Bar with Search, Filter Tabs & Add Button */}
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
            All <span className="tab-count">{albums.length}</span>
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
          <button
            className={`admin-filter-tab ${filter === "featured" ? "active" : ""}`}
            onClick={() => {
              setFilter("featured");
              setPage(1);
            }}
            type="button"
          >
            Featured
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
              placeholder="Search albums..."
              type="text"
              value={search}
            />
          </div>
          <button
            className="admin-primary-btn"
            onClick={() => setIsCreateOpen(true)}
            type="button"
          >
            <IconPlus /> Add Album
          </button>
        </div>
      </div>

      {/* Album List Cards/Grid */}
      {filtered.length === 0 ? (
        <div className="admin-empty-card">
          <span className="admin-empty-icon">
            <IconAlbums />
          </span>
          <h3>No albums found</h3>
          <p>
            {search
              ? "No albums match your search query."
              : "Get started by adding your first album or single."}
          </p>
          <button
            className="admin-primary-btn"
            onClick={() => setIsCreateOpen(true)}
            type="button"
          >
            <IconPlus /> Add Album
          </button>
        </div>
      ) : (
        <>
          <BulkActionsBar
            itemLabel="album"
            onClearSelection={() => setSelectedIds(new Set())}
            onDeleteSelected={handleBulkDelete}
            selectedCount={selectedIds.size}
            totalCount={albums.length}
          />

          <div className="admin-card-section no-padding">
            <div className="admin-table-wrapper">
              <table className="admin-modern-table">
                <thead>
                  <tr>
                    <th className="admin-table-checkbox-th">
                      <input
                        aria-label="Select all albums on page"
                        checked={isAllCurrentPageSelected}
                        className="admin-table-checkbox"
                        onChange={toggleSelectAllCurrentPage}
                        type="checkbox"
                      />
                    </th>
                    <th>Cover</th>
                    <th>Album Details</th>
                    <th>Links & Audio</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th className="align-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((album) => (
                    <tr
                      className={
                        selectedIds.has(album.id) ? "admin-row-selected" : ""
                      }
                      key={album.id}
                    >
                      <td className="admin-table-checkbox-td">
                        <input
                          aria-label={`Select album ${album.title}`}
                          checked={selectedIds.has(album.id)}
                          className="admin-table-checkbox"
                          onChange={() => toggleSelect(album.id)}
                          type="checkbox"
                        />
                      </td>
                      <td className="thumbnail-cell">
                        <div className="admin-table-thumbnail-wrap">
                          <img
                            alt={album.title}
                            className="admin-table-thumbnail"
                            src={
                              album.coverImageSrc ||
                              "/images/core-img/favicon.png"
                            }
                          />
                        </div>
                      </td>
                      <td>
                        <div className="admin-table-main-info">
                          <strong className="title">{album.title}</strong>
                          {album.subtitle && (
                            <span className="subtitle">{album.subtitle}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="admin-audio-indicators">
                          {album.audioFileSrc && (
                            <span
                              className="audio-badge"
                              title={album.audioFileSrc}
                            >
                              ♫ Audio File
                            </span>
                          )}
                          {album.externalListenUrl && (
                            <a
                              className="audio-link"
                              href={album.externalListenUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Listen Link ↗
                            </a>
                          )}
                          {album.downloadFileSrc && (
                            <span
                              className="download-badge"
                              title={album.downloadFileSrc}
                            >
                              ⬇ Download
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="admin-order-badge">
                          #{album.order}
                        </span>
                      </td>
                      <td>
                        <div className="admin-badges-stack">
                          <span
                            className={`admin-status-pill ${album.published ? "published" : "draft"}`}
                          >
                            {album.published ? "Published" : "Draft"}
                          </span>
                          {album.featured && (
                            <span className="admin-status-pill featured">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="align-right">
                        <TableActionsMenu
                          items={[
                            {
                              label: "Edit Album",
                              onClick: () => setEditingAlbum(album),
                            },
                            ...(album.externalListenUrl
                              ? [
                                  {
                                    label: "Open Listen Link ↗",
                                    onClick: () => {
                                      window.open(
                                        album.externalListenUrl as string,
                                        "_blank",
                                      );
                                    },
                                  },
                                ]
                              : []),
                            {
                              label: "Delete Album",
                              icon: <IconTrash />,
                              variant: "danger",
                              onClick: () => {
                                setDeleteTarget(album);
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
                  {filtered.length} albums
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

      {/* Create Album Modal */}
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
                <h3 className="admin-modal-title">New Album</h3>
                <p className="admin-modal-subtitle">
                  Add a new release to the catalog
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
                await createAlbum(fd);
                setIsCreateOpen(false);
                window.location.reload();
              }}
              className="admin-modal-form"
              resetOnSuccess
              successMessage="Album created successfully!"
            >
              <div className="admin-form-grid-2">
                <label className="admin-form-label">
                  <span>Album Title *</span>
                  <input
                    name="title"
                    placeholder="e.g. Grace Abounds"
                    required
                    type="text"
                  />
                </label>
                <label className="admin-form-label">
                  <span>Subtitle / Year</span>
                  <input
                    name="subtitle"
                    placeholder="e.g. EP · 2026"
                    type="text"
                  />
                </label>
              </div>

              {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput renders internal input */}
              <label className="admin-form-label">
                <span>Cover Image *</span>
                <ImageUploadInput name="coverImageSrc" required />
              </label>

              <div className="admin-form-grid-3">
                <label className="admin-form-label">
                  <span>Audio Preview URL (MP3)</span>
                  <input
                    name="audioFileSrc"
                    placeholder="https://..."
                    type="url"
                  />
                </label>
                <label className="admin-form-label">
                  <span>Listen URL (Spotify / Apple)</span>
                  <input
                    name="externalListenUrl"
                    placeholder="https://..."
                    type="url"
                  />
                </label>
                <label className="admin-form-label">
                  <span>Download File URL</span>
                  <input
                    name="downloadFileSrc"
                    placeholder="https://..."
                    type="url"
                  />
                </label>
              </div>

              <div className="admin-form-footer-row">
                <label className="admin-form-label inline-num">
                  <span>Display Order</span>
                  <input defaultValue="0" name="order" type="number" />
                </label>
                <div className="admin-checkbox-group">
                  <label className="admin-checkbox-label">
                    <input name="featured" type="checkbox" />
                    <span>Featured on Home</span>
                  </label>
                  <label className="admin-checkbox-label">
                    <input defaultChecked name="published" type="checkbox" />
                    <span>Published</span>
                  </label>
                </div>
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
                  Save Album
                </button>
              </div>
            </AdminForm>
          </div>
        </div>
      )}

      {/* Edit Album Modal */}
      {editingAlbum && (
        <div className="admin-modal-backdrop">
          <button
            aria-label="Close dialog"
            className="admin-modal-backdrop-btn"
            onClick={() => setEditingAlbum(null)}
            type="button"
          />
          <div className="admin-modal-card large" role="dialog">
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">Edit Album</h3>
                <p className="admin-modal-subtitle">
                  Modify release details and links
                </p>
              </div>
              <button
                aria-label="Close dialog"
                className="admin-modal-close-btn"
                onClick={() => setEditingAlbum(null)}
                type="button"
              >
                <IconClose />
              </button>
            </div>

            <AdminForm
              action={async (fd) => {
                await updateAlbum(fd);
                setEditingAlbum(null);
                window.location.reload();
              }}
              className="admin-modal-form"
              successMessage="Album updated successfully!"
            >
              <input name="id" type="hidden" value={editingAlbum.id} />
              <div className="admin-form-grid-2">
                <label className="admin-form-label">
                  <span>Album Title *</span>
                  <input
                    defaultValue={editingAlbum.title}
                    name="title"
                    required
                    type="text"
                  />
                </label>
                <label className="admin-form-label">
                  <span>Subtitle / Year</span>
                  <input
                    defaultValue={editingAlbum.subtitle ?? ""}
                    name="subtitle"
                    type="text"
                  />
                </label>
              </div>

              {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput renders internal input */}
              <label className="admin-form-label">
                <span>Cover Image *</span>
                <ImageUploadInput
                  defaultValue={editingAlbum.coverImageSrc}
                  name="coverImageSrc"
                  required
                />
              </label>

              <div className="admin-form-grid-3">
                <label className="admin-form-label">
                  <span>Audio Preview URL (MP3)</span>
                  <input
                    defaultValue={editingAlbum.audioFileSrc ?? ""}
                    name="audioFileSrc"
                    type="url"
                  />
                </label>
                <label className="admin-form-label">
                  <span>Listen URL (Spotify / Apple)</span>
                  <input
                    defaultValue={editingAlbum.externalListenUrl ?? ""}
                    name="externalListenUrl"
                    type="url"
                  />
                </label>
                <label className="admin-form-label">
                  <span>Download File URL</span>
                  <input
                    defaultValue={editingAlbum.downloadFileSrc ?? ""}
                    name="downloadFileSrc"
                    type="url"
                  />
                </label>
              </div>

              <div className="admin-form-footer-row">
                <label className="admin-form-label inline-num">
                  <span>Display Order</span>
                  <input
                    defaultValue={editingAlbum.order}
                    name="order"
                    type="number"
                  />
                </label>
                <div className="admin-checkbox-group">
                  <label className="admin-checkbox-label">
                    <input
                      defaultChecked={editingAlbum.featured}
                      name="featured"
                      type="checkbox"
                    />
                    <span>Featured on Home</span>
                  </label>
                  <label className="admin-checkbox-label">
                    <input
                      defaultChecked={editingAlbum.published}
                      name="published"
                      type="checkbox"
                    />
                    <span>Published</span>
                  </label>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => setEditingAlbum(null)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  Update Album
                </button>
              </div>
            </AdminForm>
          </div>
        </div>
      )}

      <ConfirmDialog
        confirmText="Delete Album"
        isOpen={Boolean(deleteTarget)}
        message={`Are you sure you want to permanently delete the album "${deleteTarget?.title || ""}"? This action cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Album"
        variant="danger"
      />
    </div>
  );
}
