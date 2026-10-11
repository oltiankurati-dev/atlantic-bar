import "server-only";
import nodemailer, { type Transporter } from "nodemailer";

/**
 * Server-only Gmail SMTP transport. Requires a Gmail account with
 * 2-Step Verification enabled and an App Password (not the regular account
 * password) — generated at myaccount.google.com/apppasswords.
 */
let transporter: Transporter | null = null;

export function isMailerConfigured() {
  return Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
}

export function getMailer(): Transporter {
  if (!transporter) {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!user || !pass) {
      throw new Error("Missing Gmail SMTP env vars. Set GMAIL_USER and GMAIL_APP_PASSWORD.");
    }
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass },
    });
  }
  return transporter;
}

/** Gmail requires the "from" address to be the authenticated account itself. */
export function getMailFrom(): string {
  const displayName = process.env.GMAIL_FROM_NAME ?? "Atlantic Lounge Bar";
  return `${displayName} <${process.env.GMAIL_USER ?? ""}>`;
}
