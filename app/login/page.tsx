"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  type UserCredential,
} from "firebase/auth";
import { getClientAuth, newGoogleProvider, newFacebookProvider } from "@/lib/firebaseClient";
import { useLanguage } from "@/app/context/LanguageContext";
import type { translations } from "@/lib/translations";

type Mode = "signin" | "signup";
type Dict = (typeof translations)["de"];

function friendlyAuthError(err: unknown, t: Dict): string {
  const code = err instanceof Error && "code" in err ? String((err as { code: unknown }).code) : "";
  // The mapped message shown to the user is deliberately generic; the real
  // code/message only goes to devtools.
  console.error("Auth error:", code || err);
  switch (code) {
    case "auth/email-already-in-use":
      return t.login.errorEmailInUse;
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return t.login.errorWrongCredentials;
    case "auth/weak-password":
      return t.login.errorWeakPassword;
    case "auth/popup-closed-by-user":
      return t.login.errorPopupClosed;
    case "sync-failed":
      return t.login.errorSyncFailed;
    default:
      return t.login.errorGeneric;
  }
}

export default function CustomerLoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<"email" | "google" | "facebook" | null>(null);

  // The one step every sign-in method was missing: sync the Firestore
  // users/{uid} profile and set the session cookie. Without this call,
  // no user document ever gets created, and there's nothing to switch to
  // "admin" in the Firebase Console.
  async function syncSessionAndRedirect(credential: UserCredential) {
    const idToken = await credential.user.getIdToken();
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      // Deliberate diagnostic for a failure class that's otherwise invisible
      // to the signed-in user.
      console.error("Session sync failed:", res.status, body?.error);
      const syncError = new Error(t.login.errorSyncFailed) as Error & { code?: string };
      syncError.code = "sync-failed";
      throw syncError;
    }

    router.push("/#reserve");
    router.refresh();
  }

  async function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading("email");
    try {
      const auth = getClientAuth();
      const credential =
        mode === "signup"
          ? await createUserWithEmailAndPassword(auth, email, password)
          : await signInWithEmailAndPassword(auth, email, password);
      await syncSessionAndRedirect(credential);
    } catch (err) {
      setError(friendlyAuthError(err, t));
    } finally {
      setLoading(null);
    }
  }

  async function handleGoogle() {
    setError(null);
    setLoading("google");
    try {
      const credential = await signInWithPopup(getClientAuth(), newGoogleProvider());
      await syncSessionAndRedirect(credential);
    } catch (err) {
      setError(friendlyAuthError(err, t));
    } finally {
      setLoading(null);
    }
  }

  async function handleFacebook() {
    setError(null);
    setLoading("facebook");
    try {
      const credential = await signInWithPopup(getClientAuth(), newFacebookProvider());
      await syncSessionAndRedirect(credential);
    } catch (err) {
      setError(friendlyAuthError(err, t));
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen bg-obsidian flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm bg-charcoal/70 border border-gold/25 p-8 md:p-10">
        <p className="font-script text-2xl text-gold-bright mb-1">Atlantic Lounge Bar</p>
        <h1 className="font-display text-2xl uppercase tracking-wide text-cream mb-2">
          {mode === "signin" ? t.login.title : t.login.titleSignup}
        </h1>
        <p className="text-xs text-smoke mb-8">{t.login.subtitle}</p>

        <div className="flex gap-2 mb-8">
          <button
            type="button"
            onClick={() => setMode("signin")}
            className={`flex-1 py-2 text-[11px] tracking-[0.2em] uppercase border ${
              mode === "signin"
                ? "border-gold text-gold-bright"
                : "border-cream/20 text-smoke hover:text-cream"
            }`}
          >
            {t.login.tabSignIn}
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 py-2 text-[11px] tracking-[0.2em] uppercase border ${
              mode === "signup"
                ? "border-gold text-gold-bright"
                : "border-cream/20 text-smoke hover:text-cream"
            }`}
          >
            {t.login.tabSignUp}
          </button>
        </div>

        <form onSubmit={handleEmailSubmit}>
          <label className="block mb-5">
            <span className="text-[11px] tracking-[0.2em] uppercase text-smoke">{t.login.emailLabel}</span>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full bg-transparent border-b border-cream/25 focus:border-gold py-2 text-cream outline-none transition-colors"
            />
          </label>

          <label className="block mb-8">
            <span className="text-[11px] tracking-[0.2em] uppercase text-smoke">{t.login.passwordLabel}</span>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full bg-transparent border-b border-cream/25 focus:border-gold py-2 text-cream outline-none transition-colors"
            />
          </label>

          <button
            type="submit"
            disabled={loading !== null}
            className="w-full border border-gold px-10 py-3.5 text-xs tracking-[0.3em] uppercase text-obsidian bg-gold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading === "email"
              ? t.login.submitLoading
              : mode === "signin"
              ? t.login.submitIdle
              : t.login.submitSignup}
          </button>
        </form>

        <div className="flex items-center gap-3 my-7">
          <span className="h-px flex-1 bg-cream/15" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-smoke">{t.login.or}</span>
          <span className="h-px flex-1 bg-cream/15" />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading !== null}
            className="w-full border border-cream/25 py-3 text-xs tracking-[0.15em] uppercase text-cream hover:border-gold hover:text-gold-bright transition-colors disabled:opacity-60"
          >
            {loading === "google" ? t.login.submitLoading : t.login.googleBtn}
          </button>
          <button
            type="button"
            onClick={handleFacebook}
            disabled={loading !== null}
            className="w-full border border-cream/25 py-3 text-xs tracking-[0.15em] uppercase text-cream hover:border-gold hover:text-gold-bright transition-colors disabled:opacity-60"
          >
            {loading === "facebook" ? t.login.submitLoading : t.login.facebookBtn}
          </button>
        </div>

        <p className="mt-6 text-[11px] text-smoke leading-relaxed">{t.login.phoneNote}</p>

        {error && <p className="mt-4 text-xs text-red-400 tracking-wide">{error}</p>}
      </div>
    </main>
  );
}
