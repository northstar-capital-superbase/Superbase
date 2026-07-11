"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import "@/components/dashboard/labs.css";
import "@/components/auth/auth.css";

// /login — the single entry point into Northstar OS. Middleware already
// redirects authenticated visitors away from this route server-side; this
// client-side effect is a fast-path for the (rare) case a session becomes
// valid while already on the page, e.g. finishing sign-up without a reload.
// useSearchParams() opts this subtree out of static rendering, so it needs
// its own Suspense boundary to prerender cleanly.
export default function LoginPage() {
  return (
    <div className="lx auth-screen">
      <div className="lx-bg" aria-hidden="true" />
      <div className="lx-grain" aria-hidden="true" />
      <div className="auth-brand">
        <NorthstarMark />
        Northstar OS
      </div>
      <Suspense fallback={null}>
        <LoginScreen />
      </Suspense>
    </div>
  );
}

function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ready, user } = useAuth();
  const redirectTo = searchParams.get("redirect") || "/labs";

  useEffect(() => {
    if (ready && user) router.replace(redirectTo);
  }, [ready, user, router, redirectTo]);

  return <LoginForm redirectTo={redirectTo} />;
}

function NorthstarMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 1.5 L13.4 10.6 L22.5 12 L13.4 13.4 L12 22.5 L10.6 13.4 L1.5 12 L10.6 10.6 Z"
        fill="currentColor"
        fillOpacity="0.88"
      />
    </svg>
  );
}
