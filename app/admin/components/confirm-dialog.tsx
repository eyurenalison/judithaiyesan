"use client";

import { useEffect, useRef, useState } from "react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

function DialogCloseIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="18"
    >
      <line x1="18" x2="6" y1="6" y2="18" />
      <line x1="6" x2="18" y1="6" y2="18" />
    </svg>
  );
}

function DialogAlertIcon() {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="22"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="22"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  );
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "danger",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      return;
    }

    // Auto-focus confirm/cancel button
    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSubmitting) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  async function handleConfirm() {
    try {
      setIsSubmitting(true);
      await onConfirm();
      onClose();
    } catch {
      // Allow error handling in caller
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      aria-labelledby="confirm-dialog-title"
      aria-modal="true"
      className="admin-dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !isSubmitting) {
          onClose();
        }
      }}
      role="dialog"
      tabIndex={-1}
    >
      <div className="admin-dialog-card" ref={dialogRef}>
        <button
          aria-label="Close dialog"
          className="admin-dialog-close-btn"
          disabled={isSubmitting}
          onClick={onClose}
          type="button"
        >
          <DialogCloseIcon />
        </button>

        <div className="admin-dialog-body">
          <div className={`admin-dialog-icon-wrap ${variant}`}>
            <DialogAlertIcon />
          </div>

          <div className="admin-dialog-content">
            <h3 className="admin-dialog-title" id="confirm-dialog-title">
              {title}
            </h3>
            <p className="admin-dialog-message">{message}</p>
          </div>
        </div>

        <div className="admin-dialog-actions">
          <button
            className="admin-dialog-cancel-btn"
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
          >
            {cancelText}
          </button>
          <button
            className={`admin-dialog-confirm-btn ${variant}`}
            disabled={isSubmitting}
            onClick={handleConfirm}
            ref={confirmBtnRef}
            type="button"
          >
            {isSubmitting ? (
              <span className="admin-btn-spinner-wrap">
                <span className="admin-btn-spinner" />
                <span>Processing...</span>
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
