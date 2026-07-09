"use client";

import Link from "next/link";
import { StarGlyph } from "./icons";
import { Landing } from "./studio/Landing";
import "./showcase.css";
import "./studio.css";

export function NorthstarShowcase() {
  return (
    <div className="nx">
      <div className="nx-aura" aria-hidden="true" />
      <div className="nx-vignette" aria-hidden="true" />
      <div className="nx-grain" aria-hidden="true" />

      <header className="nx-nav">
        <div className="nx-container nx-nav-inner">
          <Link href="/" className="nx-brand" aria-label="Northstar home">
            <span className="nx-brand-mark">
              <StarGlyph size={16} />
            </span>
            Northstar
            <span className="nx-brand-os">OS</span>
          </Link>

          <div className="nx-nav-right">
            <span className="nx-sync">
              <span className="nx-live" /> SYNCED
            </span>
            <Link href="/login" className="nx-btn nx-btn-aurora nx-glowpulse">
              Launch app
            </Link>
          </div>
        </div>
      </header>

      <main>
        <Landing />
      </main>

      <footer className="nx-footer">
        <div className="nx-container nx-footer-inner">
          <div className="nx-footer-brand">
            <StarGlyph color="#7d879c" size={16} />
            <span>Northstar Capital</span>
          </div>
          <Link href="/labs" className="nx-nav-link">
            Open the lab
          </Link>
          <div className="nx-footer-meta">
            NORTHSTAR OS · BUILD 0.3
            <br />© {new Date().getFullYear()} Northstar Capital
          </div>
        </div>
      </footer>
    </div>
  );
}
