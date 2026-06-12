"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LabsNav() {
  const pathname = usePathname();

  return (
    <nav className="labs-nav" aria-label="Northstar">
      <div className="labs-nav-inner">
        <Link href="/" className="labs-nav-brand">
          Northstar<span className="labs-nav-os">OS</span>
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
        </div>
      </div>
    </nav>
  );
}
