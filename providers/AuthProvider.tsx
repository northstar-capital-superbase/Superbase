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
import {
  ACTIVE_SETTINGS_USER_KEY,
  SETTINGS_KEY,
} from "@/components/settings/types";

export interface Profile {
  displayName: string | null;
}

export interface AuthResult {
  error: string | null;
  authenticated?: boolean;
}

interface AuthContextValue {
  // True once the initial session restore has resolved (or immediately, if
  // Auth isn't configured) — gate rendering on this to avoid a flash of the
  // signed-out state while the session is still loading.
  ready: boolean;
  // Whether Supabase Auth env vars are present at all.
  configured: boolean;
  passwordResetEnabled: boolean;
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

// Remove legacy, unscoped browser state on sign-out. Current chat/settings
// keys are namespaced by user id, so they can persist for their owner without
// ever being loaded into the next account's UI.
function clearLocalUserState(): void {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      const legacyTranscript =
        key.startsWith("northstar.labs.chat.") &&
        !key.slice("northstar.labs.chat.".length).includes(".");
      if (
        key === SETTINGS_KEY ||
        key === ACTIVE_SETTINGS_USER_KEY ||
        key === "northstar.sessions.v1" ||
        key === "northstar.labs.chatHistory" ||
        legacyTranscript ||
        key.startsWith("northstar.hint.")
      ) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // storage may be unavailable
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isSupabaseAuthConfigured();
  const passwordResetEnabled =
    process.env.NEXT_PUBLIC_PASSWORD_RESET_ENABLED === "true";
  const clientRef = useRef<SupabaseClient | null>(
    configured ? createSupabaseBrowserClient() : null,
  );
  const [ready, setReady] = useState(!configured);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const currentUserId = useRef<string | null>(null);

  const loadProfile = useCallback(async (userId: string) => {
    const client = clientRef.current;
    if (!client) return;
    const { data } = await client
      .from("profiles")
      .select("display_name")
      .eq("user_id", userId)
      .maybeSingle();
    if (currentUserId.current === userId) {
      setProfile({ displayName: data?.display_name ?? null });
    }
  }, []);

  useEffect(() => {
    const client = clientRef.current;
    if (!client) return;

    let cancelled = false;
    client.auth.getUser().then(async ({ data: userData }) => {
      if (cancelled) return;
      if (!userData.user) {
        currentUserId.current = null;
        setSession(null);
        setProfile(null);
        setReady(true);
        return;
      }
      const { data: sessionData } = await client.auth.getSession();
      if (cancelled) return;
      currentUserId.current = userData.user.id;
      setSession(sessionData.session);
      void loadProfile(userData.user.id);
      setReady(true);
    });

    // Session restore, sign-in, sign-out, and token refresh all flow through
    // this single subscription so every consumer of useAuth() stays in sync.
    const { data: sub } = client.auth.onAuthStateChange((_event, next) => {
      currentUserId.current = next?.user.id ?? null;
      setSession(next);
      if (next?.user) void loadProfile(next.user.id);
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
    return { error: error?.message ?? null, authenticated: !error };
  }, []);

  const signUpWithPassword = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const client = clientRef.current;
      if (!client) return { error: "Authentication is not configured." };
      const origin = typeof window !== "undefined" ? window.location.origin : undefined;
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: displayName ? { display_name: displayName } : undefined,
          emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
        },
      });
      return {
        error: error?.message ?? null,
        authenticated: Boolean(data.session),
      };
    },
    [],
  );

  const sendPasswordReset = useCallback(async (email: string) => {
    if (!passwordResetEnabled) {
      return { error: "Password reset email is not configured for this deployment." };
    }
    const client = clientRef.current;
    if (!client) return { error: "Authentication is not configured." };
    const origin = typeof window !== "undefined" ? window.location.origin : undefined;
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: origin ? `${origin}/auth/callback?type=recovery` : undefined,
    });
    return { error: error?.message ?? null };
  }, [passwordResetEnabled]);

  const signOut = useCallback(async () => {
    const client = clientRef.current;
    if (client) {
      const { error } = await client.auth.signOut();
      if (error) await client.auth.signOut({ scope: "local" });
    }
    currentUserId.current = null;
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
        .upsert(
          { user_id: userId, display_name: trimmed },
          { onConflict: "user_id" },
        );
      if (!error) setProfile({ displayName: trimmed });
      return { error: error?.message ?? null };
    },
    [session?.user?.id],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      configured,
      passwordResetEnabled,
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
      passwordResetEnabled,
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
