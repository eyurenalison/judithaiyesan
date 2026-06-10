"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

type ModalProps = {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
};

export function Modal({
  title,
  isOpen,
  onClose,
  children,
  className,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
    >
      <div className={className ?? "dialog-panel"}>
        <div className="dialog-header">
          <h2>{title}</h2>
          <button
            aria-label={`Close ${title}`}
            className="icon-button"
            onClick={onClose}
            type="button"
          >
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
