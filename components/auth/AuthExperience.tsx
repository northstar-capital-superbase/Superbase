"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StarGlyph } from "../showcase/icons";
import { AppleGlyph, GoogleGlyph } from "./icons";
import "../showcase/studio.css";
import "./auth.css";

type Phase = "landing" | "auth";
type Mode = "signin" | "signup" | "forgot";

const COPY: Record<Mode, { title: string; sub: string; submit: string }> = {
  signin: {
    title: "Sign in",
    sub: "Continue to your workspace.",
    submit: "Sign In",
  },
  signup: {
    title: "Create account",
    sub: "Set up your Northstar workspace.",
    submit: "Create Account",
  },
  forgot: {
    title: "Reset password",
    sub: "We'll email you a secure reset link.",
    submit: "Send reset link",
  },
};

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function AuthExperience() {
  const router = useRouter();

  const [phase, setPhase] = useState<Phase>("landing");
  const [mode, setMode] = useState<Mode>("signin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  function goToAuth() {
    setPhase("auth");
  }

  function switchMode(next: Mode) {
    setMode(next);
    setErrors({});
    setSent(false);
    if (next === "forgot") setPassword("");
  }

  function validate(): boolean {
    const next: { email?: string; password?: string } = {};
    if (!email.trim()) next.email = "Enter your email.";
    else if (!isEmail(email)) next.email = "Enter a valid email address.";

    if (mode !== "forgot") {
      if (!password) next.password = "Enter your password.";
      else if (password.length < 8)
        next.password = "Use at least 8 characters.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    // No backend auth exists yet — simulate the request, then enter the OS.
    window.setTimeout(() => {
      if (mode === "forgot") {
        setLoading(false);
        setSent(true);
        return;
      }
      router.push("/labs");
    }, 650);
  }

  const copy = COPY[mode];

  return (
    <div className="nx na-root">
      <div className="nx-aura" aria-hidden="true" />
      <div className="nx-vignette" aria-hidden="true" />
      <div className="nx-grain" aria-hidden="true" />

      <main className="na-stage">
        {phase === "landing" ? (
          <section className="na-landing na-view" aria-label="Welcome">
            <span className="na-mark">
              <StarGlyph size={26} color="#cdd9ff" />
            </span>

            <p className="na-eyebrow">AI Operating System</p>
            <h1 className="na-wordmark">
              Northstar <span className="na-os">OS</span>
            </h1>
            <p className="na-subtitle">Securely continue to your workspace.</p>

            <button
              type="button"
              className="nx-btn nx-btn-aurora na-continue"
              onClick={goToAuth}
            >
              Continue
            </button>
          </section>
        ) : (
          <section className="na-card na-view" aria-label="Authentication">
            <header className="na-card-head">
              <span className="na-mark na-mark--sm">
                <StarGlyph size={18} color="#cdd9ff" />
              </span>
              <h2 className="na-title">{copy.title}</h2>
              <p className="na-sub">{sent ? "Check your inbox." : copy.sub}</p>
            </header>

            {sent ? (
              <div className="na-sent" role="status">
                <p className="na-sent-text">
                  If an account exists for <strong>{email.trim()}</strong>,
                  a reset link is on its way.
                </p>
                <button
                  type="button"
                  className="na-link na-link--block"
                  onClick={() => switchMode("signin")}
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <>
                <form className="na-form" onSubmit={handleSubmit} noValidate>
                  <label className="na-field">
                    <span className="na-label">Email</span>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@northstar.os"
                      className={errors.email ? "na-input na-input--err" : "na-input"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-invalid={errors.email ? true : undefined}
                    />
                    {errors.email ? (
                      <span className="na-err">{errors.email}</span>
                    ) : null}
                  </label>

                  {mode !== "forgot" ? (
                    <label className="na-field">
                      <span className="na-label-row">
                        <span className="na-label">Password</span>
                        {mode === "signin" ? (
                          <button
                            type="button"
                            className="na-link na-link--sm"
                            onClick={() => switchMode("forgot")}
                          >
                            Forgot password
                          </button>
                        ) : null}
                      </span>
                      <input
                        type="password"
                        name="password"
                        autoComplete={
                          mode === "signup" ? "new-password" : "current-password"
                        }
                        placeholder="••••••••"
                        className={
                          errors.password ? "na-input na-input--err" : "na-input"
                        }
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={errors.password ? true : undefined}
                      />
                      {errors.password ? (
                        <span className="na-err">{errors.password}</span>
                      ) : null}
                    </label>
                  ) : null}

                  <button
                    type="submit"
                    className="nx-btn nx-btn-aurora na-submit"
                    disabled={loading}
                    aria-busy={loading || undefined}
                  >
                    {loading ? <span className="na-spinner" aria-hidden="true" /> : null}
                    {copy.submit}
                  </button>
                </form>

                {mode !== "forgot" ? (
                  <>
                    <div className="na-alt-line">
                      {mode === "signin" ? (
                        <>
                          <span>New to Northstar?</span>
                          <button
                            type="button"
                            className="na-link"
                            onClick={() => switchMode("signup")}
                          >
                            Create Account
                          </button>
                        </>
                      ) : (
                        <>
                          <span>Already have an account?</span>
                          <button
                            type="button"
                            className="na-link"
                            onClick={() => switchMode("signin")}
                          >
                            Sign In
                          </button>
                        </>
                      )}
                    </div>

                    <div className="na-divider">
                      <span>or</span>
                    </div>

                    <div className="na-providers">
                      <button
                        type="button"
                        className="na-provider"
                        onClick={() => router.push("/labs")}
                      >
                        <GoogleGlyph />
                        Continue with Google
                      </button>
                      <button
                        type="button"
                        className="na-provider na-provider--disabled"
                        disabled
                        aria-disabled="true"
                      >
                        <AppleGlyph />
                        Continue with Apple
                        <span className="na-soon">Soon</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="na-alt-line na-alt-line--center">
                    <button
                      type="button"
                      className="na-link"
                      onClick={() => switchMode("signin")}
                    >
                      Back to sign in
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        )}

        <button
          type="button"
          className="na-back"
          onClick={() =>
            phase === "auth" ? setPhase("landing") : router.push("/")
          }
        >
          {phase === "auth" ? "← Back" : "← Home"}
        </button>
      </main>
    </div>
  );
}
