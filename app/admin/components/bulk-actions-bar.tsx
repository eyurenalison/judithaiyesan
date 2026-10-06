"use client";

import { useState } from "react";
import { ConfirmDialog } from "./confirm-dialog";
import { IconTrash } from "./icons";

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onClearSelection: () => void;
  onDeleteSelected: () => Promise<void> | void;
  itemLabel?: string;
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onClearSelection,
  onDeleteSelected,
  itemLabel = "item",
}: BulkActionsBarProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (selectedCount === 0) return null;

  const plural = selectedCount > 1 ? `${itemLabel}s` : itemLabel;

  async function handleConfirmDelete() {
    try {
      setIsDeleting(true);
      await onDeleteSelected();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <aside aria-label="Bulk actions toolbar" className="admin-bulk-bar">
        <div className="admin-bulk-bar-info">
          <span className="admin-bulk-badge">{selectedCount}</span>
          <span className="admin-bulk-text">
            {selectedCount} of {totalCount}{" "}
            {selectedCount === 1 ? itemLabel : `${itemLabel}s`} selected
          </span>
        </div>

        <div className="admin-bulk-bar-actions">
          <button
            className="admin-bulk-clear-btn"
            disabled={isDeleting}
            onClick={onClearSelection}
            type="button"
          >
            Deselect
          </button>
          <button
            className="admin-bulk-delete-btn"
            disabled={isDeleting}
            onClick={() => setIsDialogOpen(true)}
            type="button"
          >
            <IconTrash />
            <span>{isDeleting ? "Deleting..." : "Delete Selected"}</span>
          </button>
        </div>
      </aside>

      <ConfirmDialog
        confirmText="Delete Selected"
        isOpen={isDialogOpen}
        message={`Are you sure you want to permanently delete the ${selectedCount} selected ${plural}? This action cannot be undone.`}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${selectedCount} ${plural}`}
        variant="danger"
      />
    </>
  );
}
