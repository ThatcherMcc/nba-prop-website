import { Resend } from "resend";

/**
 * Lazily-initialized Resend client.
 * Returns null when RESEND_API_KEY is not set so the build succeeds
 * in environments without email configured.
 */
export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

/** Sender address for outbound emails (falls back to a safe default). */
export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "picks@propedge.bet";
