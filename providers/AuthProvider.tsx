"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseAuthConfigured } from "@/lib/supabase/env";

export interface Profile {
  displayName: string | null;
}

export interface AuthResult {
  error: string | null;
}

interface AuthContextValue {
  // True once the initial session restore has resolved (or immediately, if
  // Auth isn't configured) — gate rendering on this to avoid a flash of the
  // signed-out state while the session is still loading.
  ready: boolean;
  // Whether Supabase Auth env vars are present at all.
  configured: boolean;
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signInWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signUpWithPassword: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<AuthResult>;
  sendPasswordReset: (email: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateDisplayName: (displayName: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Every localStorage key that can carry another user's data on a shared
// browser. Cleared on sign-out so the next person to sign in on this device
// never sees a trace of the previous session (chat history is additionally
// namespaced per-user — see components/labs/useChatHistory.ts).
const LOCAL_KEYS_TO_CLEAR_ON_SIGN_OUT = [/^northstar\.labs\./, /^northstar\.hint\./];

function clearLocalUserState(): void {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (LOCAL_KEYS_TO_CLEAR_ON_SIGN_OUT.some((re) => re.test(key))) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // storage may be unavailable
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseAuthConfigured();
  const clientRef = useRef<SupabaseClient | null>(
    configured ? createSupabaseBrowserClient() : null,
  );
  const [ready, setReady] = useState(!configured);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const client = clientRef.current;
    if (!client) return;
    const { data } = await client
      .from("profiles")
      .select("display_name")
      .eq("user_id", userId)
      .maybeSingle();
    setProfile({ displayName: data?.display_name ?? null });
  }, []);

  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;

    let cancelled = false;
    client.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      if (data.session?.user) loadProfile(data.session.user.id);
      setReady(true);
    });

    // Session restore, sign-in, sign-out, and token refresh all flow through
    // this single subscription so every consumer of useAuth() stays in sync.
    const { data: sub } = client.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next?.user) loadProfile(next.user.id);
      else setProfile(null);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    const client = clientRef.current;
    if (!client) return { error: "Authentication is not configured." };
    const { error } = await client.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUpWithPassword = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const client = clientRef.current;
      if (!client) return { error: "Authentication is not configured." };
      const origin = typeof window !== "undefined" ? window.location.origin : undefined;
      const { error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: displayName ? { display_name: displayName } : undefined,
          emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
        },
      });
      return { error: error?.message ?? null };
    },
    [],
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    const client = clientRef.current;
    if (!client) return { error: "Authentication is not configured." };
    const origin = typeof window !== "undefined" ? window.location.origin : undefined;
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: origin ? `${origin}/auth/callback?type=recovery` : undefined,
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    const client = clientRef.current;
    if (client) await client.auth.signOut();
    setSession(null);
    setProfile(null);
    clearLocalUserState();
  }, []);

  const updateDisplayName = useCallback(
    async (displayName: string) => {
      const client = clientRef.current;
      const userId = session?.user?.id;
      if (!client || !userId) return { error: "Not signed in." };
      const trimmed = displayName.trim();
      const { error } = await client
        .from("profiles")
        .update({ display_name: trimmed })
        .eq("user_id", userId);
      if (!error) setProfile({ displayName: trimmed });
      return { error: error?.message ?? null };
    },
    [session?.user?.id],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      configured,
      user: session?.user ?? null,
      session,
      profile,
      signInWithPassword,
      signUpWithPassword,
      sendPasswordReset,
      signOut,
      updateDisplayName,
    }),
    [
      ready,
      configured,
      session,
      profile,
      signInWithPassword,
      signUpWithPassword,
      sendPasswordReset,
      signOut,
      updateDisplayName,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within <AuthProvider>");
  return ctx;
}
