"use client";

import { useRef, useState } from "react";
import { GoogleRecaptcha } from "../components/google-recaptcha";
import { useToast } from "../components/toast";
import { createContactMessage } from "./actions";

export function ContactForm() {
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
      className="admin-form contact-form"
      ref={formRef}
    >
      <GoogleRecaptcha action="contact_page" />
      <div className="section-heading">
        <p className="eyebrow">Message</p>
        <h2>Send A Message</h2>
      </div>
      <label>
        Name
        <input name="name" placeholder="Your full name" required type="text" />
      </label>
      <label>
        Email
        <input
          name="email"
          placeholder="your.email@example.com"
          required
          type="email"
        />
      </label>
      <label>
        Subject
        <input
          name="subject"
          placeholder="Topic / Event / Collaboration"
          type="text"
        />
      </label>
      <label>
        Message
        <textarea
          name="message"
          placeholder="Write your message here..."
          required
          rows={7}
        />
      </label>
      <button className="primary-button" disabled={submitting} type="submit">
        {submitting ? "Sending Message..." : "Send Message"}
      </button>
    </form>
  );
}
