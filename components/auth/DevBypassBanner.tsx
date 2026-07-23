"use client";

import { useEffect, useState } from "react";
import "./dev-bypass-banner.css";

// Mandatory, persistent banner for the development auth bypass. Mounted once
// in the root layout so it appears on every route (marketing, /login, and
// every OS surface) whenever the server reports the bypass is active.
//
// This component holds no authority of its own — it only reflects the single
// server-side decision in lib/auth/devBypass.ts via GET /api/auth/dev-status.
// There is no dismiss control: the banner must stay visible for as long as
// the bypass is active, since it's the user's only persistent signal that
// authentication is disabled and data may not persist.
export function DevBypassBanner() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/dev-status", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { bypassActive: false }))
      .then((data) => {
        if (!cancelled) setActive(Boolean(data?.bypassActive));
      })
      .catch(() => {
        // Fail closed on the UI signal too: if the probe fails, stay hidden
        // rather than falsely claiming the bypass is (or isn't) active.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!active) return null;

  return (
    <div className="dev-bypass-banner" role="alert">
      <span className="dev-bypass-banner-dot" aria-hidden="true" />
      Development preview — authentication disabled — data may not persist.
    </div>
  );
}
