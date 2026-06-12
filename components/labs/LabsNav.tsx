"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function StarGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 22l-2.2-8.6L3 11l6.8-2.4L12 2z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LabsNav() {
  const pathname = usePathname();

  return (
    <nav className="labs-nav" aria-label="Northstar navigation">
      <div className="labs-nav-inner">
        <Link href="/" className="labs-nav-brand">
          <span style={{ color: "var(--ns-accent)" }}>
            <StarGlyph />
          </span>
          Northstar
          <span className="labs-nav-os">LABS</span>
        </Link>

        <div className="labs-nav-links">
          <Link href="/" className={pathname === "/" ? "is-active" : ""}>
            Home
          </Link>
          <Link href="/labs" className={pathname === "/labs" ? "is-active" : ""}>
            Labs
          </Link>
          <Link
            href="/settings"
            className={pathname?.startsWith("/settings") ? "is-active" : ""}
          >
            Settings
          </Link>
          <Link href="/labs" className="ns-btn ns-btn-primary labs-nav-cta">
            Open console
          </Link>
        </div>
      </div>
    </nav>
  );
}
