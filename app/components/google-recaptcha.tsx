"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string },
      ) => Promise<string>;
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
        },
      ) => number;
    };
  }
}

interface GoogleRecaptchaProps {
  action?: string;
  onTokenChange?: (token: string) => void;
}

export function GoogleRecaptcha({
  action = "submit_message",
  onTokenChange,
}: GoogleRecaptchaProps) {
  const [token, setToken] = useState<string>("");
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    if (!siteKey || typeof window === "undefined" || !window.grecaptcha) return;

    window.grecaptcha.ready(() => {
      window.grecaptcha
        ?.execute(siteKey, { action })
        .then((tok) => {
          setToken(tok);
          onTokenChange?.(tok);
        })
        .catch((err) => {
          console.warn("reCAPTCHA execution error:", err);
        });
    });
  }, [siteKey, action, onTokenChange]);

  return (
    <>
      {siteKey && (
        <Script
          async
          defer
          src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
          strategy="lazyOnload"
        />
      )}
      <input name="g-recaptcha-response" type="hidden" value={token} />
      {/* Bot Honeypot field: invisible to humans, attracts automated spam scrapers */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          opacity: 0,
          pointerEvents: "none",
          height: 0,
          width: 0,
          overflow: "hidden",
        }}
      >
        <label htmlFor="_website_trap">Leave this field blank</label>
        <input
          autoComplete="off"
          id="_website_trap"
          name="_website_trap"
          tabIndex={-1}
          type="text"
        />
      </div>
    </>
  );
}
