"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "../lib/db";
import {
  checkRateLimit,
  getClientIp,
  isHoneypotTriggered,
  verifyGoogleRecaptcha,
} from "../lib/security";

function readField(formData: FormData, key: string, maxLen = 2000) {
  const value = formData.get(key);
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLen);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createContactMessage(formData: FormData) {
  // 1. Anti-bot Honeypot check
  if (isHoneypotTriggered(formData, "_website_trap")) {
    console.warn("[Security] Bot blocked via honeypot trap field.");
    // Return quietly to fool bot scrapers
    return { success: true };
  }

  // 2. IP-based Rate Limiting (5 messages per 10 minutes)
  const clientIp = await getClientIp();
  const rateLimitKey = `contact_msg:${clientIp}`;
  const rateCheck = checkRateLimit(rateLimitKey, 5, 10 * 60 * 1000);

  if (!rateCheck.allowed) {
    throw new Error(
      `Too many messages submitted from your network. Please wait ${rateCheck.retryAfterSeconds} seconds before trying again.`,
    );
  }

  // 3. Google reCAPTCHA Verification (if token provided or secret configured)
  const recaptchaToken = formData.get("g-recaptcha-response") as string | null;
  const recaptchaResult = await verifyGoogleRecaptcha(recaptchaToken);
  if (!recaptchaResult.success) {
    throw new Error(
      recaptchaResult.error ||
        "Security verification failed. Please try again.",
    );
  }

  // 4. Input Sanitization & Validation
  const name = readField(formData, "name", 120);
  const email = readField(formData, "email", 160);
  const subject = readField(formData, "subject", 200);
  const message = readField(formData, "message", 4000);

  if (!name || !email || !message) {
    throw new Error("Name, valid email, and message are required.");
  }

  if (!EMAIL_REGEX.test(email)) {
    throw new Error("Please enter a valid email address.");
  }

  await getPrisma().contactMessage.create({
    data: {
      email,
      message,
      name,
      subject: subject || null,
    },
  });

  revalidatePath("/admin/messages");
  return { success: true };
}
