"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import clsx from "clsx";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9" />
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5" />
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5" />
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    href: "/trading",
    label: "Trading",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 11L5 7L8 9.5L11 5L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="15" cy="8" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: "/labs",
    label: "Labs",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 1v5L2 12a1.5 1.5 0 001.5 2h9A1.5 1.5 0 0014 12L10 6V1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M5 1h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="6.5" cy="10.5" r="1" fill="currentColor" opacity="0.6" />
      </svg>
    ),
  },
  {
    href: "/agents",
    label: "Agents",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="13" cy="5" r="1.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    href: "/memory",
    label: "Memory",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M2 8h9M2 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="13" cy="8" r="2" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
];

const BOTTOM_ITEMS: NavItem[] = [
  {
    href: "/tour",
    label: "Docs",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M9 1H3.5A1.5 1.5 0 002 2.5v11A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V6L9 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M9 1v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 9h6M5 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/",
    label: "Home",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 7L8 2l6 5v7a1 1 0 01-1 1H3a1 1 0 01-1-1V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M6 14V9h4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function NavLink({
  item,
  onClick,
}: {
  item: NavItem;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={clsx(
        "group flex min-h-[40px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150",
        active
          ? "bg-accent/10 text-accent"
          : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300",
      )}
    >
      <span
        className={clsx(
          "flex-shrink-0 transition-colors",
          active ? "text-accent" : "text-slate-600 group-hover:text-slate-400",
        )}
      >
        {item.icon}
      </span>
      <span className="flex-1 truncate font-medium">{item.label}</span>
      {active && (
        <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent opacity-75" />
      )}
    </Link>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-accent/15 shadow-glow-accent">
        <NorthstarIcon />
      </div>
      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold tracking-tight text-slate-100">
          Northstar
        </div>
        <div className="font-mono text-[9px] uppercase tracking-[0.16em] text-slate-600">
          OS
        </div>
      </div>
    </div>
  );
}

function NavLinks({ onLinkClick }: { onLinkClick?: () => void }) {
  return (
    <>
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} onClick={onLinkClick} />
          ))}
        </div>
      </div>
      <div className="border-t border-white/[0.04] px-2 py-3">
        <div className="space-y-0.5">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} onClick={onLinkClick} />
          ))}
        </div>
      </div>
    </>
  );
}

export function AppNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close drawer on route change
  const pathname = usePathname();
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <>
      {/* ── Mobile top bar ── */}
      <div className="app-topbar">
        <Brand />
        <button
          type="button"
          aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-slate-200 active:bg-white/[0.08]"
        >
          {drawerOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* ── Mobile drawer ── */}
      {drawerOpen && (
        <>
          <div
            className="app-drawer-overlay"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="app-drawer">
            <div className="flex items-center justify-between border-b border-white/[0.04] px-4 py-3.5">
              <Brand />
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setDrawerOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:text-slate-300"
              >
                <XIcon />
              </button>
            </div>
            <NavLinks onLinkClick={() => setDrawerOpen(false)} />
          </div>
        </>
      )}

      {/* ── Desktop sidebar ── */}
      <nav className="app-nav">
        <div className="flex items-center gap-2.5 border-b border-white/[0.04] px-4 py-4">
          <Brand />
        </div>
        <NavLinks />
      </nav>
    </>
  );
}

function NorthstarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2l1.8 5.8 5.8 1.2-4.8 3.8 1.8 5.8-4.6-3.2-4.6 3.2 1.8-5.8L3.4 9l5.8-1.2L12 2z"
        fill="currentColor"
        className="text-accent"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        d="M2 4.5h14M2 9h14M2 13.5h14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M3 3l10 10M13 3L3 13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
