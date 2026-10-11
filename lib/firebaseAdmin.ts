import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

/**
 * Env UIs mangle multi-line secrets in many ways: surrounding quotes copied
 * from .env files, literal "\n", Windows "\r\n", stray spaces after the
 * header. Rebuild a clean PEM from whatever was pasted so none of those
 * break production with "DECODER routines::unsupported".
 */
function normalizePrivateKey(raw: string): string {
  const key = raw
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\\n/g, "\n")
    .replace(/\r/g, "");
  const match = key.match(/-----BEGIN ([A-Z ]+)-----([\s\S]*?)-----END \1-----/);
  if (!match) {
    throw new Error("FIREBASE_PRIVATE_KEY is not a PEM key (no BEGIN/END PRIVATE KEY lines found).");
  }
  const [, label, body] = match;
  const lines = body.replace(/\s+/g, "").match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----\n`;
}

/**
 * Server-only Firebase Admin initialization.
 * Never import this file from a "use client" component — the service
 * account key must stay on the server.
 */
export function getAdminApp(): App {
  const existing = getApps();
  if (existing.length > 0) return existing[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;
  const privateKey = rawKey ? normalizePrivateKey(rawKey) : undefined;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin env vars. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY."
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getDb() {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
