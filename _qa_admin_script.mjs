// Privileged helper for e2e/authenticated-flow.spec.ts — does the steps a
// real admin would do by hand in the Firebase/Cloudinary consoles (look up a
// uid, promote to admin, clean up test data). Credentials come from
// .env.local at runtime; nothing secret lives in this file.
//
// Usage: node _qa_admin_script.mjs <command> <arg>
//   get-uid-by-email <email>   -> {"uid": "..."}
//   promote <uid>              -> sets users/{uid}.role = "admin", prints {"ok": true}
//   delete-doc <collection/id> -> deletes one Firestore document
//   cloudinary-destroy <publicId>
//   teardown <uid>             -> deletes the user's reservations, profile doc, and auth account
import { existsSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { v2 as cloudinary } from "cloudinary";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

// Same normalization as lib/firebaseAdmin.ts.
function normalizePrivateKey(raw) {
  const key = raw.trim().replace(/^["']|["']$/g, "").replace(/\\n/g, "\n").replace(/\r/g, "");
  const match = key.match(/-----BEGIN ([A-Z ]+)-----([\s\S]*?)-----END \1-----/);
  if (!match) throw new Error("FIREBASE_PRIVATE_KEY is not a PEM key.");
  const [, label, body] = match;
  const lines = body.replace(/\s+/g, "").match(/.{1,64}/g) ?? [];
  return `-----BEGIN ${label}-----\n${lines.join("\n")}\n-----END ${label}-----\n`;
}

const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY ?? ""),
  }),
});
const auth = getAuth(app);
const db = getFirestore(app);

const [cmd, arg] = process.argv.slice(2);
if (!cmd || !arg) {
  console.error("Usage: node _qa_admin_script.mjs <command> <arg>");
  process.exit(2);
}

// Refuse to touch anything that isn't a throwaway QA account.
async function assertQaUser(uid) {
  const user = await auth.getUser(uid);
  if (!user.email?.startsWith("qa-security-test-")) {
    throw new Error(`Refusing to modify non-QA account ${uid} (${user.email}).`);
  }
}

switch (cmd) {
  case "get-uid-by-email": {
    const user = await auth.getUserByEmail(arg);
    console.log(JSON.stringify({ uid: user.uid }));
    break;
  }
  case "promote": {
    await assertQaUser(arg);
    await db.collection("users").doc(arg).set({ role: "admin" }, { merge: true });
    console.log(JSON.stringify({ ok: true }));
    break;
  }
  case "delete-doc": {
    if (!/^(reservations|galleryImages)\/[A-Za-z0-9_-]+$/.test(arg)) {
      throw new Error(`Refusing to delete unexpected path: ${arg}`);
    }
    await db.doc(arg).delete();
    console.log("ok");
    break;
  }
  case "cloudinary-destroy": {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    const result = await cloudinary.uploader.destroy(arg, { invalidate: true });
    console.log(result.result);
    break;
  }
  case "teardown": {
    await assertQaUser(arg);
    const reservations = await db.collection("reservations").where("userId", "==", arg).get();
    await Promise.all(reservations.docs.map((doc) => doc.ref.delete()));
    await db.collection("users").doc(arg).delete();
    await auth.deleteUser(arg);
    console.log(`ok (deleted ${reservations.size} reservation(s), profile, auth user)`);
    break;
  }
  default:
    console.error(`Unknown command: ${cmd}`);
    process.exit(2);
}
