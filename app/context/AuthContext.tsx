"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth";
import { getClientAuth } from "@/lib/firebaseClient";

interface Profile {
  role: "user" | "admin";
  phoneVerified: boolean;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  /** True only for Google/Facebook sign-ins that haven't linked a phone number yet. */
  needsPhoneVerification: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  needsPhoneVerification: false,
  refreshProfile: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const loadMe = async () => (await fetch("/api/me", { cache: "no-store" })).json();
      let data = await loadMe();

      // Firebase keeps the browser signed in indefinitely, but the server's
      // session cookie expires after 5 days. Re-issue it from a fresh ID token
      // so returning users (and admins) don't silently lose server access.
      const currentUser = getClientAuth().currentUser;
      if (!data.user && currentUser) {
        const idToken = await currentUser.getIdToken();
        const res = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        if (res.ok) data = await loadMe();
      }

      setProfile(
        data.user ? { role: data.user.role, phoneVerified: data.user.phoneVerified } : null
      );
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getClientAuth(), async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile();
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchProfile]);

  async function signOut() {
    await firebaseSignOut(getClientAuth());
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
    setProfile(null);
  }

  // Google/Facebook accounts must link a phone number; email/password ones need not.
  const isOAuthOnly =
    !!user && user.providerData.every((p) => p.providerId !== "password");
  const phoneConfirmed = profile?.phoneVerified === true || Boolean(user?.phoneNumber);
  const needsPhoneVerification = isOAuthOnly && !phoneConfirmed;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin: profile?.role === "admin",
        needsPhoneVerification,
        refreshProfile: fetchProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
