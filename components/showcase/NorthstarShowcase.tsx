"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StarGlyph } from "./icons";
import { Landing } from "./studio/Landing";
import { Overview } from "./studio/Overview";
import { RobinhoodAgentic } from "./studio/RobinhoodAgentic";
import { LabsSection } from "./studio/LabsSection";
import type { StudioSection } from "./types";
import "./showcase.css";
import "./studio.css";

const SECTIONS: { id: StudioSection; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "overview", label: "Overview" },
  { id: "robinhood", label: "Robinhood" },
  { id: "labs", label: "Labs" },
];

export function NorthstarShowcase() {
  const [section, setSection] = useState<StudioSection>("home");

  // Jump back to the top whenever the active section changes.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [section]);

  return (
    <div className="nx">
      <div className="nx-aura" aria-hidden="true" />
      <div className="nx-vignette" aria-hidden="true" />
      <div className="nx-grain" aria-hidden="true" />

      <header className="nx-nav">
        <div className="nx-container nx-nav-inner">
          <button
            type="button"
            className="nx-brand"
            onClick={() => setSection("home")}
            aria-label="Northstar home"
          >
            <span className="nx-brand-mark">
              <StarGlyph size={16} />
            </span>
            Northstar
            <span className="nx-brand-os">OS</span>
          </button>

          <nav className="nx-tabs" aria-label="Sections">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`nx-tab ${section === s.id ? "is-active" : ""}`}
                onClick={() => setSection(s.id)}
              >
                <span className="nx-tab-dot" />
                {s.label}
              </button>
            ))}
          </nav>

          <div className="nx-nav-right">
            <span className="nx-sync">
              <span className="nx-live" /> SYNCED
            </span>
            <Link href="/labs" className="nx-nav-link">
              Live lab
            </Link>
          </div>
        </div>
      </header>

      <main key={section}>
        {section === "home" && <Landing onNavigate={setSection} />}
        {section === "overview" && <Overview onNavigate={setSection} />}
        {section === "robinhood" && <RobinhoodAgentic />}
        {section === "labs" && <LabsSection />}
      </main>

      <footer className="nx-footer">
        <div className="nx-container nx-footer-inner">
          <div className="nx-footer-brand">
            <StarGlyph color="#7d879c" size={16} />
            <span>Northstar Capital</span>
          </div>
          <nav className="nx-tabs" aria-label="Footer sections">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`nx-tab ${section === s.id ? "is-active" : ""}`}
                onClick={() => setSection(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>
          <div className="nx-footer-meta">
            NORTHSTAR OS · BUILD 0.3
            <br />© {new Date().getFullYear()} Northstar Capital
          </div>
        </div>
      </footer>
    </div>
  );
}
