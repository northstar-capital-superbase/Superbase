"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useAuth } from "@/hooks/useAuth";
import { Alert, OwnerNote } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { safeRedirectPath } from "@/lib/auth/redirect";
import "./auth.css";

type Mode = "sign-in" | "sign-up" | "forgot";

// The single entry point for Northstar OS authentication: Sign In, Create
// Account, and Forgot Password, all backed by real Supabase Auth (email +
// password) — no simulated/placeholder login path.
export function LoginForm({ redirectTo = "/labs" }: { redirectTo?: string }) {
  const router = useRouter();
  const safeRedirectTo = safeRedirectPath(redirectTo);
  const {
    configured,
    passwordResetEnabled,
    signInWithPassword,
    signUpWithPassword,
    sendPasswordReset,
  } = useAuth();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const resetMessages = () => {
    setError(null);
    setNotice(null);
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    resetMessages();
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!configured) {
      setError("Authentication is not configured for this deployment.");
      return;
    }
    resetMessages();
    setBusy(true);
    try {
      if (mode === "sign-in") {
        const { error: err } = await signInWithPassword(email.trim(), password);
        if (err) {
          setError(err);
          return;
        }
        router.replace(safeRedirectTo);
        router.refresh();
        return;
      }

      if (mode === "sign-up") {
        const { error: err, authenticated } = await signUpWithPassword(
          email.trim(),
          password,
          displayName.trim() || undefined,
        );
        if (err) {
          setError(err);
          return;
        }
        if (authenticated) {
          router.replace(safeRedirectTo);
          router.refresh();
        } else {
          setNotice(
            "Check your email to confirm the account, then return here to sign in.",
          );
        }
        return;
      }

      // Forgot password
      const { error: err } = await sendPasswordReset(email.trim());
      if (err) {
        setError(err);
        return;
      }
      setNotice("If an account exists for that email, a reset link is on its way.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-panel">
      <div className="auth-body">
        <h1 className="auth-title">
          {mode === "sign-in" && "Sign in"}
          {mode === "sign-up" && "Create your account"}
          {mode === "forgot" && "Reset your password"}
        </h1>
        <p className="auth-sub">
          {mode === "sign-in" && "Welcome back to your Northstar OS."}
          {mode === "sign-up" && "Your own account, profile, memory, and settings."}
          {mode === "forgot" && "We'll email you a link to choose a new password."}
        </p>

        {!configured && (
          <OwnerNote>
            Authentication is not configured. Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, then apply{" "}
            <code>supabase/schema.sql</code> to your project.
          </OwnerNote>
        )}
        {error && (
          <Alert tone="danger" role="alert" className="auth-alert">
            {error}
          </Alert>
        )}
        {notice && (
          <Alert tone="info" role="status" className="auth-alert">
            {notice}
          </Alert>
        )}

        <form onSubmit={onSubmit} className="auth-form">
          {mode === "sign-up" && (
            <label className="auth-field">
              <span>Display name (optional)</span>
              <Input
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={busy}
                maxLength={80}
              />
            </label>
          )}

          <label className="auth-field">
            <span>Email</span>
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={busy}
            />
          </label>

          {mode !== "forgot" && (
            <label className="auth-field">
              <span>Password</span>
              <Input
                type="password"
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={busy}
              />
            </label>
          )}

          <Button
            type="submit"
            variant="primary"
            className="auth-submit"
            loading={busy}
            disabled={!configured}
          >
            {mode === "sign-in" && "Sign in"}
            {mode === "sign-up" && "Create account"}
            {mode === "forgot" && "Send reset link"}
          </Button>
        </form>

        {mode === "sign-in" && (
          <>
            {passwordResetEnabled && (
              <button
                type="button"
                className="auth-link"
                onClick={() => switchMode("forgot")}
                disabled={!configured}
              >
                Forgot password?
              </button>
            )}
            <p className="auth-switch">
              New to Northstar?{" "}
              <button type="button" className="auth-link auth-link--inline" onClick={() => switchMode("sign-up")}>
                Create an account
              </button>
            </p>
          </>
        )}

        {mode === "sign-up" && (
          <p className="auth-switch">
            Already have an account?{" "}
            <button type="button" className="auth-link auth-link--inline" onClick={() => switchMode("sign-in")}>
              Sign in
            </button>
          </p>
        )}

        {mode === "forgot" && (
          <button
            type="button"
            className={clsx("auth-link")}
            onClick={() => switchMode("sign-in")}
          >
            ← Back to sign in
          </button>
        )}
      </div>
    </div>
  );
}
