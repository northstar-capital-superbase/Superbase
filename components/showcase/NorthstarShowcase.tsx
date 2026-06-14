"use client";

import Link from "next/link";
import { useState } from "react";
import { HomePage } from "./HomePage";
import { Login } from "./Login";
import { OsDashboard } from "./OsDashboard";
import { MOCK, type MockUser, type ShowcaseView } from "./types";
import "./showcase.css";

export function NorthstarShowcase() {
  const [view, setView] = useState<ShowcaseView>("home");
  const [user, setUser] = useState<MockUser | null>(null);

  const go = (v: ShowcaseView) => {
    if (v === "dashboard" && !user) setUser(MOCK.user);
    setView(v);
  };

  return (
    <div className="ns-root">
      <div className="ns-view" key={view}>
        {view === "home" && <HomePage onLaunch={() => setView("login")} />}
        {view === "login" && (
          <Login
            onLogin={(u) => {
              setUser(u);
              setView("dashboard");
            }}
            onBack={() => setView("home")}
          />
        )}
        {view === "dashboard" && (
          <OsDashboard
            user={user || MOCK.user}
            onLogout={() => {
              setUser(null);
              setView("home");
            }}
          />
        )}
      </div>

      {/* Product navigation pill */}
      <nav className="ns-rev" role="navigation" aria-label="Product navigation">
        {(
          [
            ["home", "Home"],
            ["login", "Sign in"],
            ["dashboard", "Preview"],
          ] as const
        ).map(([v, l]) => (
          <button
            key={v}
            type="button"
            className={`ns-rev-btn ${view === v ? "is-active" : ""}`}
            onClick={() => go(v)}
          >
            {l}
          </button>
        ))}
        <span className="ns-rev-divider" aria-hidden="true" />
        <Link href="/dashboard" className="ns-rev-link">
          Dashboard →
        </Link>
        <Link href="/labs" className="ns-rev-link">
          Labs
        </Link>
      </nav>
    </div>
  );
}
