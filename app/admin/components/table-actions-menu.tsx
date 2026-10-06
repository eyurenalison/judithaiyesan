"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { IconMoreHorizontal } from "./icons";

export type ActionMenuItem = {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "danger";
  disabled?: boolean;
};

interface TableActionsMenuProps {
  items?: ActionMenuItem[];
  children?: ReactNode;
  align?: "right" | "left";
  placement?: "bottom" | "top";
}

export function TableActionsMenu({
  items,
  children,
  align = "right",
  placement = "bottom",
}: TableActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div
      className={`admin-actions-menu-wrap ${isOpen ? "open" : ""}`}
      ref={containerRef}
    >
      <button
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="More actions"
        className={`admin-actions-menu-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        type="button"
      >
        <IconMoreHorizontal />
      </button>

      {isOpen && (
        <div
          className={`admin-actions-menu-dropdown align-${align} placement-${placement}`}
          role="menu"
        >
          {items?.map((item) => (
            <button
              className={`admin-action-item ${item.variant ?? "default"}`}
              disabled={item.disabled}
              key={item.label}
              onClick={() => {
                setIsOpen(false);
                item.onClick?.();
              }}
              role="menuitem"
              type="button"
            >
              {item.icon && (
                <span className="admin-action-item-icon">{item.icon}</span>
              )}
              <span>{item.label}</span>
            </button>
          ))}
          {children && (
            <div className="admin-action-menu-custom">{children}</div>
          )}
        </div>
      )}
    </div>
  );
}
