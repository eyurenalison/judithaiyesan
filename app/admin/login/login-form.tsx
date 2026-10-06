"use client";

import { useState, useTransition } from "react";
import { adminSignIn } from "../actions";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await adminSignIn(formData);
        if (res?.error) {
          setError(res.error);
        }
      } catch (err: unknown) {
        // Next.js redirect throws NEXT_REDIRECT, which should navigate away
        const isRedirect =
          err &&
          typeof err === "object" &&
          "digest" in err &&
          typeof (err as { digest?: string }).digest === "string" &&
          (err as { digest: string }).digest.startsWith("NEXT_REDIRECT");

        if (!isRedirect) {
          setError("An unexpected error occurred. Please try again.");
        }
      }
    });
  }

  return (
    <form action={handleSubmit} className="admin-login-form-modern">
      {error && (
        <div className="admin-login-error-banner" role="alert">
          <span className="error-icon">⚠</span>
          <span className="error-text">{error}</span>
        </div>
      )}

      <div className="admin-login-input-group">
        <label className="admin-form-label" htmlFor="email-input">
          <span>Email Address</span>
          <input
            autoComplete="email"
            id="email-input"
            name="email"
            placeholder="admin@judithaiyesan.com"
            required
            type="email"
          />
        </label>
      </div>

      <div className="admin-login-input-group">
        <label className="admin-form-label" htmlFor="password-input">
          <div className="label-row-with-action">
            <span>Password</span>
            <button
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              type="button"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            autoComplete="current-password"
            id="password-input"
            name="password"
            placeholder="••••••••••••"
            required
            type={showPassword ? "text" : "password"}
          />
        </label>
      </div>

      <button
        className="primary-button admin-login-submit-btn"
        disabled={isPending}
        type="submit"
      >
        {isPending ? (
          <span className="button-loading-content">
            <span className="spinner-dot" />
            Authenticating...
          </span>
        ) : (
          "Sign In to Dashboard &rarr;"
        )}
      </button>

      <p className="admin-login-help-text">
        Protected administrator portal for Judith Aiyesan website management.
      </p>
    </form>
  );
}
