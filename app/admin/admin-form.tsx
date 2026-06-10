"use client";

import { type ReactNode, useRef, useTransition } from "react";
import { useToast } from "../components/toast";

type AdminFormProps = {
  action: (formData: FormData) => Promise<void>;
  children: ReactNode;
  className?: string;
  successMessage?: string;
  resetOnSuccess?: boolean;
};

export function AdminForm({
  action,
  children,
  className,
  successMessage = "Saved successfully!",
  resetOnSuccess = false,
}: AdminFormProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await action(formData);
        showToast(successMessage, "success");
        if (resetOnSuccess && formRef.current) {
          formRef.current.reset();
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        showToast(message, "error");
      }
    });
  }

  return (
    <form
      action={handleSubmit}
      className={`${className ?? ""} ${isPending ? "form-pending" : ""}`.trim()}
      ref={formRef}
    >
      {children}
      {isPending ? <div className="form-pending-overlay" /> : null}
    </form>
  );
}
