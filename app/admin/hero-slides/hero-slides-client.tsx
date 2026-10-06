"use client";

import { useMemo, useState } from "react";
import { useToast } from "../../components/toast";
import {
  createHeroSlide,
  deleteHeroSlide,
  deleteHeroSlidesBulk,
  updateHeroSlide,
} from "../actions";
import { AdminForm } from "../admin-form";
import { BulkActionsBar } from "../components/bulk-actions-bar";
import { ConfirmDialog } from "../components/confirm-dialog";
import {
  IconClose,
  IconHeroSlides,
  IconPlus,
  IconSearch,
  IconTrash,
} from "../components/icons";
import { TableActionsMenu } from "../components/table-actions-menu";
import { ImageUploadInput } from "../image-upload-input";

type HeroSlideItem = {
  id: string;
  title: string;
  subtitle: string | null;
  imageSrc: string;
  buttonLabel: string | null;
  buttonUrl: string | null;
  order: number;
  published: boolean;
  createdAt: Date;
};

export function HeroSlidesClient({
  initialSlides,
}: {
  initialSlides: HeroSlideItem[];
}) {
  const { showToast } = useToast();
  const [slides, setSlides] = useState<HeroSlideItem[]>(initialSlides);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlideItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlideItem | null>(null);

  async function handleConfirmDelete() {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    try {
      const fd = new FormData();
      fd.set("id", targetId);
      await deleteHeroSlide(fd);
      setSlides((prev) => prev.filter((s) => s.id !== targetId));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(targetId);
        return next;
      });
      showToast("Hero slide deleted successfully.", "success");
    } catch {
      showToast("Failed to delete slide.", "error");
    }
  }

  const filtered = useMemo(() => {
    return slides.filter((s) => {
      if (filter === "published" && !s.published) return false;
      if (filter === "draft" && s.published) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          (s.subtitle ?? "").toLowerCase().includes(q) ||
          (s.buttonLabel ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [slides, filter, search]);

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
      await deleteHeroSlidesBulk(fd);
      setSlides((prev) => prev.filter((s) => !selectedIds.has(s.id)));
      setSelectedIds(new Set());
      showToast(
        `${count} slide${count > 1 ? "s" : ""} deleted successfully.`,
        "success",
      );
    } catch {
      showToast("Failed to delete selected slides.", "error");
    }
  }

  return (
    <div className="admin-content-stack">
      {/* Controls Bar */}
      <div className="admin-controls-card">
        <div className="admin-filter-tabs">
          <button
            className={`admin-filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
            type="button"
          >
            All <span className="tab-count">{slides.length}</span>
          </button>
          <button
            className={`admin-filter-tab ${filter === "published" ? "active" : ""}`}
            onClick={() => setFilter("published")}
            type="button"
          >
            Published
          </button>
          <button
            className={`admin-filter-tab ${filter === "draft" ? "active" : ""}`}
            onClick={() => setFilter("draft")}
            type="button"
          >
            Draft
          </button>
        </div>

        <div className="admin-controls-right">
          <div className="admin-search-box">
            <IconSearch />
            <input
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search slides..."
              type="text"
              value={search}
            />
          </div>
          <button
            className="admin-primary-btn"
            onClick={() => setIsCreateOpen(true)}
            type="button"
          >
            <IconPlus /> New Slide
          </button>
        </div>
      </div>

      {/* Visual Slide Cards Grid */}
      {filtered.length === 0 ? (
        <div className="admin-empty-card">
          <span className="admin-empty-icon">
            <IconHeroSlides />
          </span>
          <h3>No hero slides found</h3>
          <p>
            {search
              ? "No slides match your search criteria."
              : "Create high-impact banners for the homepage hero carousel."}
          </p>
          <button
            className="admin-primary-btn"
            onClick={() => setIsCreateOpen(true)}
            type="button"
          >
            <IconPlus /> New Slide
          </button>
        </div>
      ) : (
        <>
          <BulkActionsBar
            itemLabel="slide"
            onClearSelection={() => setSelectedIds(new Set())}
            onDeleteSelected={handleBulkDelete}
            selectedCount={selectedIds.size}
            totalCount={slides.length}
          />

          <div className="admin-slides-grid">
            {filtered.map((slide) => (
              <article
                className={`admin-slide-card ${
                  selectedIds.has(slide.id) ? "admin-row-selected" : ""
                }`}
                key={slide.id}
              >
                <div className="admin-slide-card-preview">
                  <img
                    alt={slide.title}
                    className="admin-slide-img"
                    src={slide.imageSrc}
                  />
                  <div className="admin-slide-overlay">
                    <div className="admin-slide-badges">
                      <input
                        aria-label={`Select slide ${slide.title}`}
                        checked={selectedIds.has(slide.id)}
                        className="admin-table-checkbox"
                        onChange={() => toggleSelect(slide.id)}
                        type="checkbox"
                      />
                      <span className="admin-order-badge">#{slide.order}</span>
                      <span
                        className={`admin-status-pill ${slide.published ? "published" : "draft"}`}
                      >
                        {slide.published ? "Live" : "Draft"}
                      </span>
                    </div>
                    <div className="admin-slide-preview-text">
                      {slide.subtitle && (
                        <span className="slide-subtitle">{slide.subtitle}</span>
                      )}
                      <h3 className="slide-title">{slide.title}</h3>
                      {slide.buttonLabel && (
                        <span className="slide-cta-preview">
                          CTA: {slide.buttonLabel} &rarr;
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="admin-slide-card-footer">
                  <div className="admin-slide-meta">
                    <small className="slide-url" title={slide.buttonUrl ?? ""}>
                      {slide.buttonUrl
                        ? `Links to: ${slide.buttonUrl}`
                        : "No CTA link"}
                    </small>
                  </div>
                  <TableActionsMenu
                    items={[
                      {
                        label: "Edit Slide",
                        onClick: () => setEditingSlide(slide),
                      },
                      ...(slide.buttonUrl
                        ? [
                            {
                              label: "Open Link ↗",
                              onClick: () => {
                                window.open(
                                  slide.buttonUrl as string,
                                  "_blank",
                                );
                              },
                            },
                          ]
                        : []),
                      {
                        label: "Delete Slide",
                        icon: <IconTrash />,
                        variant: "danger",
                        onClick: () => {
                          setDeleteTarget(slide);
                        },
                      },
                    ]}
                    placement="top"
                  />
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {/* Create Slide Modal */}
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
                <h3 className="admin-modal-title">New Hero Slide</h3>
                <p className="admin-modal-subtitle">
                  Add a banner to the homepage hero
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
                await createHeroSlide(fd);
                setIsCreateOpen(false);
                window.location.reload();
              }}
              className="admin-modal-form"
              resetOnSuccess
              successMessage="Slide created successfully!"
            >
              <div className="admin-form-grid-2">
                <label className="admin-form-label">
                  <span>Main Headline *</span>
                  <input
                    name="title"
                    placeholder="e.g. Living Praise Experience"
                    required
                    type="text"
                  />
                </label>
                <label className="admin-form-label">
                  <span>Subtitle / Tagline</span>
                  <input
                    name="subtitle"
                    placeholder="e.g. New Single Out Now"
                    type="text"
                  />
                </label>
              </div>

              {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput handles control */}
              <label className="admin-form-label">
                <span>Background Image *</span>
                <ImageUploadInput name="imageSrc" required />
              </label>

              <div className="admin-form-grid-2">
                <label className="admin-form-label">
                  <span>Button Label</span>
                  <input
                    name="buttonLabel"
                    placeholder="e.g. Listen Now"
                    type="text"
                  />
                </label>
                <label className="admin-form-label">
                  <span>Button Link URL</span>
                  <input
                    name="buttonUrl"
                    placeholder="e.g. /albums or https://..."
                    type="text"
                  />
                </label>
              </div>

              <div className="admin-form-footer-row">
                <label className="admin-form-label inline-num">
                  <span>Display Order</span>
                  <input defaultValue="0" name="order" type="number" />
                </label>
                <label className="admin-checkbox-label">
                  <input defaultChecked name="published" type="checkbox" />
                  <span>Published</span>
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
                  Save Slide
                </button>
              </div>
            </AdminForm>
          </div>
        </div>
      )}

      {/* Edit Slide Modal */}
      {editingSlide && (
        <div className="admin-modal-backdrop">
          <button
            aria-label="Close dialog"
            className="admin-modal-backdrop-btn"
            onClick={() => setEditingSlide(null)}
            type="button"
          />
          <div className="admin-modal-card large" role="dialog">
            <div className="admin-modal-header">
              <div>
                <h3 className="admin-modal-title">Edit Hero Slide</h3>
                <p className="admin-modal-subtitle">
                  Modify headlines, image, or link
                </p>
              </div>
              <button
                aria-label="Close dialog"
                className="admin-modal-close-btn"
                onClick={() => setEditingSlide(null)}
                type="button"
              >
                <IconClose />
              </button>
            </div>

            <AdminForm
              action={async (fd) => {
                await updateHeroSlide(fd);
                setEditingSlide(null);
                window.location.reload();
              }}
              className="admin-modal-form"
              successMessage="Slide updated successfully!"
            >
              <input name="id" type="hidden" value={editingSlide.id} />
              <div className="admin-form-grid-2">
                <label className="admin-form-label">
                  <span>Main Headline *</span>
                  <input
                    defaultValue={editingSlide.title}
                    name="title"
                    required
                    type="text"
                  />
                </label>
                <label className="admin-form-label">
                  <span>Subtitle / Tagline</span>
                  <input
                    defaultValue={editingSlide.subtitle ?? ""}
                    name="subtitle"
                    type="text"
                  />
                </label>
              </div>

              {/* biome-ignore lint/a11y/noLabelWithoutControl: ImageUploadInput handles control */}
              <label className="admin-form-label">
                <span>Background Image *</span>
                <ImageUploadInput
                  defaultValue={editingSlide.imageSrc}
                  name="imageSrc"
                  required
                />
              </label>

              <div className="admin-form-grid-2">
                <label className="admin-form-label">
                  <span>Button Label</span>
                  <input
                    defaultValue={editingSlide.buttonLabel ?? ""}
                    name="buttonLabel"
                    type="text"
                  />
                </label>
                <label className="admin-form-label">
                  <span>Button Link URL</span>
                  <input
                    defaultValue={editingSlide.buttonUrl ?? ""}
                    name="buttonUrl"
                    type="text"
                  />
                </label>
              </div>

              <div className="admin-form-footer-row">
                <label className="admin-form-label inline-num">
                  <span>Display Order</span>
                  <input
                    defaultValue={editingSlide.order}
                    name="order"
                    type="number"
                  />
                </label>
                <label className="admin-checkbox-label">
                  <input
                    defaultChecked={editingSlide.published}
                    name="published"
                    type="checkbox"
                  />
                  <span>Published</span>
                </label>
              </div>

              <div className="admin-modal-actions">
                <button
                  className="secondary-button"
                  onClick={() => setEditingSlide(null)}
                  type="button"
                >
                  Cancel
                </button>
                <button className="primary-button" type="submit">
                  Update Slide
                </button>
              </div>
            </AdminForm>
          </div>
        </div>
      )}

      <ConfirmDialog
        confirmText="Delete Slide"
        isOpen={Boolean(deleteTarget)}
        message={`Are you sure you want to permanently delete the slide "${deleteTarget?.title || ""}"? This action cannot be undone.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Hero Slide"
        variant="danger"
      />
    </div>
  );
}
