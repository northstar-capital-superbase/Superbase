"use client";

import Link from "next/link";
import clsx from "clsx";

export type OsRoute = "lab" | "settings";

const LINKS: { key: OsRoute; label: string; href: string }[] = [
  { key: "lab", label: "Lab", href: "/labs" },
  { key: "settings", label: "Settings", href: "/settings" },
];

// Primary navigation shared across the OS surfaces (Labs, Settings).
export function OsNav({ active }: { active: OsRoute }) {
  return (
    <nav className="lx-nav" aria-label="Primary">
      {LINKS.map((l) => (
        <Link
          key={l.key}
          href={l.href}
          className={clsx("lx-nav-link", active === l.key && "active")}
          aria-current={active === l.key ? "page" : undefined}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
