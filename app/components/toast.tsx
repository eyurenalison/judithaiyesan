"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

type ToastVariant = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let nextId = 0;

const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

const defaultToastContext: ToastContextValue = {
  showToast: () => {},
};

export function useToast() {
  const ctx = useContext(ToastContext);
  return ctx ?? defaultToastContext;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, message, variant }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div aria-live="polite" className="toast-container">
        {toasts.map((toast) => (
          <div className={`toast toast-${toast.variant}`} key={toast.id}>
            <span className="toast-icon">{VARIANT_ICONS[toast.variant]}</span>
            <span className="toast-message">{toast.message}</span>
            <button
              aria-label="Dismiss"
              className="toast-dismiss"
              onClick={() => dismiss(toast.id)}
              type="button"
            >
              ✕
            </button>
            <div className="toast-progress" />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
