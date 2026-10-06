"use client";

import { useMemo, useState } from "react";
import { useToast } from "../../components/toast";
import { deleteMedia, deleteMediaBulk } from "../actions";
import { BulkActionsBar } from "../components/bulk-actions-bar";
import { ConfirmDialog } from "../components/confirm-dialog";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconClose,
  IconCopy,
  IconExternalLink,
  IconMedia,
  IconPlus,
  IconSearch,
  IconTrash,
} from "../components/icons";
import { TableActionsMenu } from "../components/table-actions-menu";
import { MediaUploader } from "./media-uploader";

type MediaItem = {
  id: string;
  type: string;
  url: string;
  altText: string | null;
  filename: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: Date;
};

export function MediaClient({ initialMedia }: { initialMedia: MediaItem[] }) {
  const { showToast } = useToast();
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    "all" | "image" | "audio" | "video"
  >("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    title?: string;
  } | null>(null);

  const PAGE_SIZE = viewMode === "grid" ? 12 : 10;

  const filtered = useMemo(() => {
    return mediaList.filter((m) => {
      if (typeFilter !== "all" && m.type !== typeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (m.filename ?? "").toLowerCase().includes(q) ||
          (m.altText ?? "").toLowerCase().includes(q) ||
          m.url.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [mediaList, typeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page, PAGE_SIZE]);

  async function copyUrl(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      showToast("URL copied to clipboard!", "success");
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      showToast("Failed to copy URL", "error");
    }
  }

  function formatBytes(bytes: number | null) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const isAllCurrentPageSelected =
    paginated.length > 0 && paginated.every((m) => selectedIds.has(m.id));

  function toggleSelectAllCurrentPage() {
    if (isAllCurrentPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const m of paginated) {
          next.delete(m.id);
        }
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const m of paginated) {
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

  async function handleBulkDelete() {
    const count = selectedIds.size;
    try {
      const fd = new FormData();
      fd.set("ids", JSON.stringify(Array.from(selectedIds)));
      await deleteMediaBulk(fd);
      setMediaList((prev) => prev.filter((m) => !selectedIds.has(m.id)));
      setSelectedIds(new Set());
      showToast(
        `${count} media asset${count > 1 ? "s" : ""} deleted successfully.`,
        "success",
      );
    } catch {
      showToast("Failed to delete selected media assets.", "error");
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    try {
      const fd = new FormData();
      fd.set("id", targetId);
      await deleteMedia(fd);
      setMediaList((prev) => prev.filter((m) => m.id !== targetId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
      showToast("Media asset deleted successfully.", "success");
    } catch {
      showToast("Failed to delete media asset.", "error");
    }
  }

  return (
    <div className="admin-content-stack">
      {/* Controls Bar */}
      <div className="admin-controls-card">
        <div className="admin-filter-tabs">
          <button
            className={`admin-filter-tab ${typeFilter === "all" ? "active" : ""}`}
            onClick={() => {
              setTypeFilter("all");
              setPage(1);
            }}
            type="button"
          >
            All <span className="tab-count">{mediaList.length}</span>
          </button>
          <button
            className={`admin-filter-tab ${typeFilter === "image" ? "active" : ""}`}
            onClick={() => {
              setTypeFilter("image");
              setPage(1);
            }}
            type="button"
          >
            Images
          </button>
          <button
            className={`admin-filter-tab ${typeFilter === "audio" ? "active" : ""}`}
            onClick={() => {
              setTypeFilter("audio");
              setPage(1);
            }}
            type="button"
          >
            Audio
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
              placeholder="Search by filename or URL..."
              type="text"
              value={search}
            />
          </div>

          <div className="admin-view-switcher">
            <button
              className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
              title="Grid View"
              type="button"
            >
              ⊞
            </button>
            <button
              className={`view-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
              title="Table View"
              type="button"
            >
              ☰
            </button>
          </div>

          <button
            className="admin-primary-btn"
            onClick={() => setIsUploaderOpen(!isUploaderOpen)}
            type="button"
          >
            <IconPlus /> Upload Files
          </button>
        </div>
      </div>

      {/* Collapsible Uploader Box */}
      {isUploaderOpen && (
        <div className="admin-card-section highlighted">
          <div className="admin-uploader-section-header">
            <div>
              <h3>Upload Media Asset</h3>
              <p>Upload photos, artwork, audio recordings, or videos</p>
            </div>
            <button
              aria-label="Close uploader"
              className="admin-modal-close-btn"
              onClick={() => setIsUploaderOpen(false)}
              type="button"
            >
              <IconClose />
            </button>
          </div>
          <MediaUploader />
        </div>
      )}

      {/* Media Content */}
      {filtered.length === 0 ? (
        <div className="admin-empty-card">
          <span className="admin-empty-icon">
            <IconMedia />
          </span>
          <h3>No media files found</h3>
          <p>
            {search
              ? "No files matched your search term."
              : "Upload images, music audio, or video clips to your cloud library."}
          </p>
          <button
            className="admin-primary-btn"
            onClick={() => setIsUploaderOpen(true)}
            type="button"
          >
            <IconPlus /> Upload Files
          </button>
        </div>
      ) : (
        <>
          <BulkActionsBar
            itemLabel="media file"
            onClearSelection={() => setSelectedIds(new Set())}
            onDeleteSelected={handleBulkDelete}
            selectedCount={selectedIds.size}
            totalCount={mediaList.length}
          />

          {viewMode === "grid" ? (
            /* Modern Gallery Grid */
            <div className="admin-media-grid">
              {paginated.map((item) => (
                <div
                  className={`admin-media-item-card ${
                    selectedIds.has(item.id) ? "admin-row-selected" : ""
                  }`}
                  key={item.id}
                >
                  <div className="media-preview-container">
                    <input
                      aria-label={`Select ${item.filename || "media"}`}
                      checked={selectedIds.has(item.id)}
                      className="admin-table-checkbox"
                      onChange={() => toggleSelect(item.id)}
                      type="checkbox"
                    />
                    {item.type === "image" ? (
                      <img
                        alt={item.altText ?? item.filename ?? "Media"}
                        className="media-preview-img"
                        loading="lazy"
                        src={item.url}
                      />
                    ) : (
                      <div className="media-preview-fallback">
                        <span className="fallback-icon">♫</span>
                        <span className="fallback-type">
                          {item.type.toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="media-type-pill">{item.type}</span>
                  </div>

                  <div className="media-meta-body">
                    <span
                      className="media-filename"
                      title={item.filename ?? item.url}
                    >
                      {item.filename || item.url.split("/").pop()}
                    </span>
                    <span className="media-filesize">
                      {formatBytes(item.sizeBytes)}
                    </span>
                  </div>

                  <div className="media-card-actions">
                    <button
                      className={`copy-btn ${copiedId === item.id ? "copied" : ""}`}
                      onClick={() => copyUrl(item.url, item.id)}
                      title="Copy CDN link to clipboard"
                      type="button"
                    >
                      {copiedId === item.id ? (
                        <>
                          <IconCheck /> Copied
                        </>
                      ) : (
                        <>
                          <IconCopy /> Copy URL
                        </>
                      )}
                    </button>
                    <a
                      className="open-btn"
                      href={item.url}
                      rel="noreferrer"
                      target="_blank"
                      title="Open in new tab"
                    >
                      <IconExternalLink />
                    </a>
                    <TableActionsMenu
                      items={[
                        {
                          label: "Copy URL",
                          icon: <IconCopy />,
                          onClick: () => copyUrl(item.url, item.id),
                        },
                        {
                          label: "Open in New Tab ↗",
                          icon: <IconExternalLink />,
                          onClick: () => window.open(item.url, "_blank"),
                        },
                        {
                          label: "Delete Asset",
                          icon: <IconTrash />,
                          variant: "danger",
                          onClick: () => {
                            setDeleteTarget({
                              id: item.id,
                              title:
                                item.filename ||
                                item.url.split("/").pop() ||
                                "media asset",
                            });
                          },
                        },
                      ]}
                      placement="top"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div className="admin-card-section no-padding">
              <div className="admin-table-wrapper">
                <table className="admin-modern-table">
                  <thead>
                    <tr>
                      <th className="admin-table-checkbox-th">
                        <input
                          aria-label="Select all media on page"
                          checked={isAllCurrentPageSelected}
                          className="admin-table-checkbox"
                          onChange={toggleSelectAllCurrentPage}
                          type="checkbox"
                        />
                      </th>
                      <th>Preview</th>
                      <th>Filename / Title</th>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Date</th>
                      <th className="align-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((item) => (
                      <tr
                        className={
                          selectedIds.has(item.id) ? "admin-row-selected" : ""
                        }
                        key={item.id}
                      >
                        <td className="admin-table-checkbox-td">
                          <input
                            aria-label={`Select ${item.filename || "media"}`}
                            checked={selectedIds.has(item.id)}
                            className="admin-table-checkbox"
                            onChange={() => toggleSelect(item.id)}
                            type="checkbox"
                          />
                        </td>
                        <td className="thumbnail-cell">
                          <div className="admin-table-thumbnail-wrap">
                            {item.type === "image" ? (
                              <img
                                alt={item.filename ?? "Media"}
                                className="admin-table-thumbnail"
                                src={item.url}
                              />
                            ) : (
                              <span className="admin-table-thumbnail-text">
                                ♫
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="admin-table-main-info">
                            <strong className="title">
                              {item.filename || item.url.split("/").pop()}
                            </strong>
                            <code className="url-code-snip">{item.url}</code>
                          </div>
                        </td>
                        <td>
                          <span className="admin-status-pill neutral">
                            {item.type}
                          </span>
                        </td>
                        <td>{formatBytes(item.sizeBytes)}</td>
                        <td>
                          <span className="admin-table-date">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="align-right">
                          <TableActionsMenu
                            items={[
                              {
                                label: "Copy URL",
                                icon: <IconCopy />,
                                onClick: () => copyUrl(item.url, item.id),
                              },
                              {
                                label: "Open in New Tab ↗",
                                icon: <IconExternalLink />,
                                onClick: () => window.open(item.url, "_blank"),
                              },
                              {
                                label: "Delete Asset",
                                icon: <IconTrash />,
                                variant: "danger",
                                onClick: () => {
                                  setDeleteTarget({
                                    id: item.id,
                                    title:
                                      item.filename ||
                                      item.url.split("/").pop() ||
                                      "media asset",
                                  });
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
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-pagination-bar">
          <span className="admin-pagination-text">
            Showing {(page - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
            files
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

      <ConfirmDialog
        confirmText="Delete Asset"
        isOpen={Boolean(deleteTarget)}
        message={`Are you sure you want to permanently delete "${deleteTarget?.title || "this asset"}"? This action cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Media Asset"
        variant="danger"
      />
    </div>
  );
}
