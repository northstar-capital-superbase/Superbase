"use client";

import { useState } from "react";
import { Arrow, StarGlyph } from "./icons";
import { MOCK, type MockUser } from "./types";

export function Login({
  onLogin,
  onBack,
}: {
  onLogin: (user: MockUser) => void;
  onBack: () => void;
}) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");

  return (
    <div className="ns-auth">
      <div className="ns-auth-bg" aria-hidden="true">
        <svg
          viewBox="0 0 1200 600"
          preserveAspectRatio="xMidYMid slice"
          className="ns-auth-svg"
        >
          <defs>
            <radialGradient id="ag" cx="50%" cy="30%" r="60%">
              <stop offset="0%" stopColor="#6E8BFF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#06070A" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="as" x1="0" x2="1">
              <stop offset="0%" stopColor="#E2B17C" stopOpacity="0" />
              <stop offset="50%" stopColor="#E2B17C" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#E2B17C" stopOpacity="0" />
            </linearGradient>
          </defs>
          <rect width="1200" height="600" fill="url(#ag)" />
          {[180, 250, 320, 390, 460].map((y, i) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="1200"
              y2={y}
              stroke="url(#as)"
              strokeWidth="1.5"
              className="ns-stream"
              style={{ animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </svg>
      </div>
      <div className="ns-auth-panel">
        <div className="ns-os-bar">
          <span className="ns-os-name">
            <StarGlyph color="#7d879c" size={12} /> NORTHSTAR OS
          </span>
          <span className="ns-os-status">
            <i className="ns-live" /> PRIVATE PREVIEW
          </span>
        </div>
        <div className="ns-auth-body">
          <h1 className="ns-auth-title">Sign in to Northstar</h1>
          <p className="ns-auth-sub">
            Access the operating system for your capital.
          </p>
          <label className="ns-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@northstar.os"
              autoComplete="email"
            />
          </label>
          <label className="ns-field">
            <span>Password</span>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>
          <button
            type="button"
            className="ns-btn ns-btn-primary ns-auth-btn"
            onClick={() =>
              onLogin({ ...MOCK.user, email: email || MOCK.user.email })
            }
          >
            Sign in <Arrow />
          </button>
          <button
            type="button"
            className="ns-auth-demo"
            onClick={() => onLogin(MOCK.user)}
          >
            Continue with demo account
          </button>
          <button type="button" className="ns-auth-back" onClick={onBack}>
            ← Back to site
          </button>
          <p className="ns-auth-note">DEMO · ANY CREDENTIALS WORK</p>
        </div>
      </div>
    </div>
  );
}
