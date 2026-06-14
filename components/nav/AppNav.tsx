"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.9"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.5"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity="0.3"/>
      </svg>
    ),
  },
  {
    href: "/trading",
    label: "Trading",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M1 11L5 7L8 9.5L11 5L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="15" cy="8" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    href: "/labs",
    label: "Labs",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 1v5L2 12a1.5 1.5 0 001.5 2h9A1.5 1.5 0 0014 12L10 6V1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M5 1h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="6.5" cy="10.5" r="1" fill="currentColor" opacity="0.6"/>
      </svg>
    ),
  },
  {
    href: "/agents",
    label: "Agents",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="13" cy="5" r="1.5" fill="currentColor" opacity="0.5"/>
      </svg>
    ),
  },
  {
    href: "/memory",
    label: "Memory",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h12M2 8h9M2 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="13" cy="8" r="2" fill="currentColor" opacity="0.5"/>
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
        <path d="M9 1H3.5A1.5 1.5 0 002 2.5v11A1.5 1.5 0 003.5 15h9a1.5 1.5 0 001.5-1.5V6L9 1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M9 1v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 9h6M5 12h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    href: "/",
    label: "Home",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 7L8 2l6 5v7a1 1 0 01-1 1H3a1 1 0 01-1-1V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M6 14V9h4v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

function NavLink({ item, collapsed = false }: { item: NavItem; collapsed?: boolean }) {
  const pathname = usePathname();
  const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

  return (
    <Link
      href={item.href}
      className={clsx(
        "group flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all duration-150",
        active
          ? "bg-accent/10 text-accent"
          : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-300",
      )}
    >
      <span className={clsx("flex-shrink-0 transition-colors", active ? "text-accent" : "text-slate-600 group-hover:text-slate-400")}>
        {item.icon}
      </span>
      {!collapsed && (
        <span className="flex-1 truncate font-medium">{item.label}</span>
      )}
      {!collapsed && item.badge && (
        <span className="rounded-sm bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] text-accent">
          {item.badge}
        </span>
      )}
      {active && (
        <span className="ml-auto h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent opacity-75" />
      )}
    </Link>
  );
}

export function AppNav() {
  return (
    <nav className="app-nav">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-white/[0.04] px-4 py-4">
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

      {/* Primary nav */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="border-t border-white/[0.04] px-2 py-3">
        <div className="space-y-0.5">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </div>
      </div>
    </nav>
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
