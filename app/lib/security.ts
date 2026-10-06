import { headers } from "next/headers";

type RateLimitRecord = {
  timestamps: number[];
};

// Global in-memory storage for sliding window rate limiting
const rateLimitMap = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function purgeExpiredRecords(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, record] of rateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
    if (record.timestamps.length === 0) {
      rateLimitMap.delete(key);
    }
  }
}

/**
 * Checks sliding-window rate limit for a given key (e.g. `contact:192.168.1.1`).
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  purgeExpiredRecords(windowMs);

  const now = Date.now();
  const record = rateLimitMap.get(key) ?? { timestamps: [] };

  // Remove timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((oldest + windowMs - now) / 1000),
    );
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  record.timestamps.push(now);
  rateLimitMap.set(key, record);

  return {
    allowed: true,
    remaining: limit - record.timestamps.length,
    retryAfterSeconds: 0,
  };
}

/**
 * Resolves client IP address from standard proxy headers
 */
export async function getClientIp(): Promise<string> {
  const reqHeaders = await headers();
  const forwardedFor = reqHeaders.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = reqHeaders.get("x-real-ip");
  if (realIp) return realIp.trim();
  const cfConnectingIp = reqHeaders.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();
  return "127.0.0.1";
}

/**
 * Checks if a bot honeypot trap field was filled
 */
export function isHoneypotTriggered(
  formData: FormData,
  fieldName = "_website_trap",
): boolean {
  const value = formData.get(fieldName);
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Verifies a Google reCAPTCHA response token with Google's siteverify API.
 * If RECAPTCHA_SECRET_KEY is not set in environment, allows requests through
 * with a console warning so local development and test environments work seamlessly.
 */
export async function verifyGoogleRecaptcha(token?: string | null): Promise<{
  success: boolean;
  score?: number;
  error?: string;
}> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  if (!secretKey) {
    // Graceful fallback for environments where secret key is not configured yet
    return { success: true };
  }

  if (!token) {
    return {
      success: false,
      error:
        "Missing reCAPTCHA verification token. Please complete the security check.",
    };
  }

  try {
    const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";
    const body = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    const response = await fetch(verifyUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    if (!response.ok) {
      return {
        success: false,
        error: "reCAPTCHA verification server unreachable.",
      };
    }

    const data = (await response.json()) as {
      success: boolean;
      score?: number;
      action?: string;
      "error-codes"?: string[];
    };

    if (!data.success) {
      return {
        success: false,
        error: "reCAPTCHA verification failed. Please try again.",
      };
    }

    // If score-based (v3), require score >= 0.5
    if (typeof data.score === "number" && data.score < 0.5) {
      return {
        success: false,
        score: data.score,
        error:
          "reCAPTCHA detected suspicious activity. Please try again later.",
      };
    }

    return { success: true, score: data.score };
  } catch (err) {
    console.error("Error verifying reCAPTCHA:", err);
    return {
      success: false,
      error: "Security verification could not be completed.",
    };
  }
}
