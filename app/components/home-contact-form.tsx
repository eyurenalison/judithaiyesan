"use client";

import { useRef, useState } from "react";
import { createContactMessage } from "../contact/actions";
import { GoogleRecaptcha } from "./google-recaptcha";
import { useToast } from "./toast";

export function HomeContactForm() {
  const { showToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      action={async (formData) => {
        try {
          setSubmitting(true);
          await createContactMessage(formData);
          showToast(
            "Thank you! Your message has been sent successfully.",
            "success",
          );
          formRef.current?.reset();
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Failed to send message.";
          showToast(msg, "error");
        } finally {
          setSubmitting(false);
        }
      }}
      className="home-contact-form"
      ref={formRef}
    >
      <GoogleRecaptcha action="contact_submit" />
      <input name="name" placeholder="Name" required type="text" />
      <input name="email" placeholder="E-mail" required type="email" />
      <input name="subject" placeholder="Subject" type="text" />
      <textarea name="message" placeholder="Message" required rows={8} />
      <button
        className="home-outline-button"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
