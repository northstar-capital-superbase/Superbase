"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import clsx from "clsx";
import { useSettingsContext } from "@/components/settings/SettingsProvider";
import { useRuntimeStatus, type RuntimeStatus } from "@/components/useRuntimeStatus";
import { useAuth } from "@/hooks/useAuth";
import { greetingName } from "@/lib/auth/greeting";
import { SignOutButton } from "@/components/auth/SignOutButton";
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Search,
  Bot,
  Brain,
  Zap,
  Wrench,
  Rocket,
  Link2,
  Shield,
  Settings,
  MessageSquare,
  ChevronLeft,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import "./sidebar.css";

type NavItem = {
  key: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string;
  children?: NavItem[];
};

type NavSectionDef = {
  key: string;
  label?: string;
  items: NavItem[];
};

// Items with a "soon" badge are rendered as inert rows (no navigation) so the
// roadmap stays visible without dead links to routes that don't exist yet.
const SECTIONS: NavSectionDef[] = [
  {
    key: "workspace",
    items: [
      {
        key: "command",
        label: "Command Center",
        icon: LayoutDashboard,
        href: "/labs",
        // The AI chat lives here as a nested Lab Console entry — the only
        // sidebar item that opens the chat.
        children: [
          { key: "console", label: "Lab Console", icon: MessageSquare, href: "/labs/console" },
        ],
      },
      { key: "portfolio", label: "Portfolio",       icon: BarChart3,       href: "/portfolio", badge: "soon" },
      { key: "markets",   label: "Markets",         icon: TrendingUp,      href: "/markets",   badge: "soon" },
      { key: "research",  label: "Research",        icon: Search,          href: "/research",  badge: "soon" },
      { key: "agents",    label: "Agents",          icon: Bot,             href: "/agents",    badge: "soon" },
      { key: "memory",    label: "Memory",          icon: Brain,           href: "/memory",    badge: "soon" },
      { key: "workflows", label: "Workflows",       icon: Zap,             href: "/workflows", badge: "soon" },
    ],
  },
  {
    key: "labs",
    label: "Northstar Labs",
    items: [
      { key: "builder",     label: "Agent Builder",    icon: Wrench,       href: "/builder", badge: "soon" },
      { key: "sandbox",     label: "Sandbox",          icon: Rocket,       href: "/sandbox", badge: "soon" },
    ],
  },
  {
    key: "system",
    label: "System",
    items: [
      { key: "connections", label: "Connections", icon: Link2,    href: "/connections" },
      { key: "security",    label: "Security",    icon: Shield,   href: "/security", badge: "soon" },
      { key: "settings",    label: "Settings",    icon: Settings, href: "/settings" },
    ],
  },
];

// Shared easing curve (avoids type inference issues with string literals)
const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];

// OS `prefers-reduced-motion` + both in-app motion settings, combined.
// Framer-motion animates via JS (inline styles), so the [data-motion] CSS
// rules don't reach it — every motion.* in this file must gate on this.
function useMotionOff(): boolean {
  const reduceMotion = useReducedMotion();
  const { settings } = useSettingsContext();
  return (
    !!reduceMotion ||
    settings.appearance.reducedMotion ||
    !settings.appearance.animations
  );
}

export function OsSidebar() {
  const { settings, ready } = useSettingsContext();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const runtime = useRuntimeStatus();
  const motionOff = useMotionOff();

  // Adopt the Appearance → Sidebar default once, after settings hydrate.
  // Manual ⌘\ toggles thereafter win for the rest of the session.
  const appliedDefault = useRef(false);
  useEffect(() => {
    if (ready && !appliedDefault.current) {
      setCollapsed(settings.appearance.sidebar === "collapsed");
      appliedDefault.current = true;
    }
  }, [ready, settings.appearance.sidebar]);

  // Sync --sb-width so the content area margin animates in lockstep
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sb-width",
      collapsed ? "64px" : "280px",
    );
  }, [collapsed]);

  // Keyboard shortcut: ⌘\ or Ctrl+\
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "\\") {
        e.preventDefault();
        setCollapsed((c) => !c);
      }
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  const toggle = () => setCollapsed((c) => !c);
  const dur = motionOff ? 0 : 0.22;

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="sb-mobile-trigger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        aria-haspopup="dialog"
        aria-expanded={mobileOpen}
      >
        <Menu size={18} strokeWidth={1.8} />
      </button>

      {/* Desktop sidebar */}
      <motion.aside
        className={clsx("sb", { "sb--collapsed": collapsed })}
        animate={{ width: collapsed ? 64 : 280 }}
        transition={{ duration: dur, ease: EASE_OUT }}
        aria-label="Primary navigation"
      >
        <SidebarContent
          collapsed={collapsed}
          pathname={pathname}
          onToggle={toggle}
          onMobileClose={() => setMobileOpen(false)}
          runtime={runtime}
        />
      </motion.aside>

      {/* Mobile overlay + floating bubble drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="sb-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: motionOff ? 0 : 0.16 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="sb sb--mobile"
              initial={{ x: motionOff ? 0 : -340, opacity: motionOff ? 1 : 0.6 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: motionOff ? 0 : -340, opacity: motionOff ? 1 : 0.6 }}
              transition={
                motionOff
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 420, damping: 38 }
              }
              aria-label="Primary navigation"
              role="dialog"
              aria-modal="true"
            >
              <SidebarContent
                collapsed={false}
                pathname={pathname}
                onToggle={() => setMobileOpen(false)}
                onMobileClose={() => setMobileOpen(false)}
                runtime={runtime}
                mobile
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Sidebar inner content ─────────────────────────────────────────────────

function SidebarContent({
  collapsed,
  pathname,
  onToggle,
  onMobileClose,
  runtime,
  mobile = false,
}: {
  collapsed: boolean;
  pathname: string;
  onToggle: () => void;
  onMobileClose: () => void;
  runtime: RuntimeStatus;
  mobile?: boolean;
}) {
  const motionOff = useMotionOff();
  // App-specific runtime line — derived from live health, never hardcoded.
  const statusLine = !runtime.loaded
    ? { tone: "off" as const, label: "Checking runtime…" }
    : !runtime.reachable
      ? { tone: "warn" as const, label: "Crew API unreachable" }
      : runtime.configured
        ? { tone: "on" as const, label: `${runtime.provider} crew online` }
        : { tone: "warn" as const, label: "Crew idle — no model key" };

  return (
    <div className="sb-inner">
      {/* Brand */}
      <div className="sb-brand">
        <div className="sb-brand-icon" aria-hidden="true">
          <NorthstarIcon />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              key="brand-text"
              className="sb-brand-text"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: motionOff ? 0 : 0.16, ease: EASE_OUT }}
            >
              <span className="sb-brand-name">Northstar OS</span>
              <span className="sb-brand-sub">AI Operating System for Finance</span>
            </motion.div>
          )}
        </AnimatePresence>
        {mobile && (
          <button
            className="sb-mobile-close"
            onClick={onMobileClose}
            aria-label="Close navigation"
          >
            <X size={16} strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Live runtime line */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            key="status-top"
            className="sb-status-top"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionOff ? 0 : 0.15 }}
          >
            <span
              className={clsx(
                "sb-status-dot",
                statusLine.tone === "on" && "sb-status-dot--online",
                statusLine.tone === "warn" && "sb-status-dot--warn",
              )}
            />
            <span className="sb-status-label">{statusLine.label}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sb-divider" />

      {/* Scrollable nav with collapsible sections */}
      <nav className="sb-nav" aria-label="OS Navigation">
        {SECTIONS.map((section, i) => (
          <div key={section.key}>
            {i > 0 && <div className="sb-divider" />}
            <NavSection
              section={section}
              collapsed={collapsed}
              pathname={pathname}
              onClick={mobile ? onMobileClose : undefined}
            />
          </div>
        ))}
      </nav>

      {/* Bottom live-status panel */}
      <div className="sb-bottom">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              key="status-panel"
              className="sb-status-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: motionOff ? 0 : 0.1, ease: EASE_OUT }}
            >
              <RuntimeRows runtime={runtime} />

              <div className="sb-divider sb-divider--footer" />

              <TradingSummary runtime={runtime} onNavigate={mobile ? onMobileClose : undefined} />

              <div className="sb-divider sb-divider--footer" />

              <UserFooter />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapse toggle */}
        <button
          className="sb-collapse-btn"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title="Toggle sidebar (⌘\\)"
        >
          <motion.span
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: motionOff ? 0 : 0.22, ease: EASE_OUT }}
            style={{ display: "flex", alignItems: "center" }}
          >
            <ChevronLeft size={15} strokeWidth={2} />
          </motion.span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                key="collapse-label"
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -4 }}
                transition={{ duration: motionOff ? 0 : 0.14, ease: EASE_OUT }}
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}

// ── Live footer rows ──────────────────────────────────────────────────────

function RuntimeRows({ runtime }: { runtime: RuntimeStatus }) {
  const rows = !runtime.loaded
    ? [{ label: "Runtime", status: "checking…", color: "var(--sb-text-3)", pulse: true }]
    : [
        {
          label: "Language model",
          status: runtime.configured ? (runtime.provider ?? "live") : "no key",
          color: runtime.configured ? "#5bd6a8" : "#e2b17c",
          pulse: runtime.configured,
        },
        {
          label: "Shared memory",
          status: runtime.memory === "supabase" ? "Supabase" : "in-memory",
          color: runtime.memory === "supabase" ? "#5bd6a8" : "#8a90a0",
          pulse: false,
        },
        {
          label: "Robinhood MCP",
          status: runtime.tradingEnabled ? (runtime.tradingMode ?? "live") : "off",
          color: runtime.tradingEnabled ? "#5bd6a8" : "#8a90a0",
          pulse: runtime.tradingEnabled,
        },
      ];

  return (
    <div className="sb-status-agents">
      {rows.map((r) => (
        <div key={r.label} className="sb-status-row">
          <span className="sb-status-name">{r.label}</span>
          <span
            className="sb-status-badge"
            style={{ "--dot-color": r.color } as React.CSSProperties}
          >
            <span
              className={clsx("sb-status-pulse", r.pulse && "sb-status-pulse--blink")}
            />
            {r.status}
          </span>
        </div>
      ))}
    </div>
  );
}

// Trading footer: real state only. When the Robinhood MCP is connected we show
// the live policy; otherwise a connect prompt.
// NEEDS_OWNER_INPUT: live portfolio value/NAV is not wired yet — once the
// Robinhood MCP connection is active, this block can call get_portfolio via
// POST /api/trading?action=call to show the real account value.
function TradingSummary({
  runtime,
  onNavigate,
}: {
  runtime: RuntimeStatus;
  onNavigate?: () => void;
}) {
  return (
    <div className="sb-portfolio">
      <div className="sb-portfolio-label">Portfolio</div>
      {runtime.tradingEnabled ? (
        <>
          <div className="sb-portfolio-value">Robinhood MCP live</div>
          <div className="sb-portfolio-note">
            {runtime.tradingMode ?? "advisory"} mode · Trader joins crew runs
          </div>
        </>
      ) : (
        <>
          <div className="sb-portfolio-value">Portfolio unavailable</div>
          <div className="sb-portfolio-note">
            Connect Robinhood to begin. Northstar never shows placeholder balances.
          </div>
          <Link href="/connections" className="sb-portfolio-link" onClick={onNavigate}>
            Connect Robinhood →
          </Link>
        </>
      )}
    </div>
  );
}

// Real signed-in identity — email + display name resolved from Supabase
// Auth/profiles, never hardcoded. Sign out here destroys the session and
// clears local per-user UI state, then returns to /login.
function UserFooter() {
  const { user, profile } = useAuth();
  if (!user) return null;
  const name = greetingName(profile?.displayName, user.email);
  const initial = (name ?? "?").charAt(0).toUpperCase();

  return (
    <div className="sb-user">
      <span className="sb-user-avatar" aria-hidden="true">
        {initial}
      </span>
      <span className="sb-user-main">
        <span className="sb-user-name">{name ?? "Signed in"}</span>
        <span className="sb-user-email">{user.email}</span>
      </span>
      <SignOutButton variant="default" size="sm" className="sb-user-signout" aria-label="Sign out">
        <SignOutGlyph />
      </SignOutButton>
    </div>
  );
}

function SignOutGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

// ── Nav section (collapsible) ─────────────────────────────────────────────

function NavSection({
  section,
  collapsed,
  pathname,
  onClick,
}: {
  section: NavSectionDef;
  collapsed: boolean;
  pathname: string;
  onClick?: () => void;
}) {
  const [open, setOpen] = useState(true);
  const showItems = collapsed || open;
  const motionOff = useMotionOff();

  return (
    <div className="sb-nav-section">
      {section.label && !collapsed && (
        <button
          type="button"
          className="sb-section-head"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          {section.label}
          <span className="sb-section-chevron" aria-hidden="true">
            <ChevronDown size={12} strokeWidth={2.2} />
          </span>
        </button>
      )}
      {/* Transform-based reveal (opacity + small y-slide) — animating height
          re-runs layout every frame, so the row list fades/slides instead and
          the container reflows exactly once on mount/unmount. */}
      <AnimatePresence initial={false}>
        {showItems && (
          <motion.div
            key="items"
            initial={{ opacity: 0, y: motionOff ? 0 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: motionOff ? 0 : -6 }}
            transition={{ duration: motionOff ? 0 : 0.16, ease: EASE_OUT }}
            style={{ overflow: "hidden" }}
          >
            {section.items.map((item) =>
              item.children && item.children.length > 0 ? (
                <NavGroup
                  key={item.key}
                  item={item}
                  pathname={pathname}
                  collapsed={collapsed}
                  onClick={onClick}
                />
              ) : (
                <NavItemRow
                  key={item.key}
                  item={item}
                  active={isNavActive(item.href, pathname)}
                  collapsed={collapsed}
                  onClick={onClick}
                />
              ),
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Exact match for /labs (Command Center), prefix match for everything else so
// nested routes like /labs/console highlight their own entry, not Command Center.
function isNavActive(href: string, pathname: string): boolean {
  if (href === "/labs") return pathname === "/labs";
  return pathname === href || pathname.startsWith(href + "/");
}

// ── Nav group (parent item with nested children) ──────────────────────────

function NavGroup({
  item,
  pathname,
  collapsed,
  onClick,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const children = item.children ?? [];
  const parentActive = isNavActive(item.href, pathname);
  const childActive = children.some((c) => isNavActive(c.href, pathname));
  const [open, setOpen] = useState(parentActive || childActive);
  const Icon = item.icon;
  const motionOff = useMotionOff();

  // Collapsed rail: no nesting UI — show only the parent icon row.
  if (collapsed) {
    return <NavItemRow item={item} active={parentActive} collapsed onClick={onClick} />;
  }

  return (
    <div className="sb-nav-group">
      <div className="sb-nav-row">
        <Link
          href={item.href}
          className={clsx("sb-nav-item", parentActive && "sb-nav-item--active")}
          aria-current={parentActive ? "page" : undefined}
          onClick={onClick}
        >
          <span className="sb-nav-icon">
            <Icon size={17} strokeWidth={1.6} />
          </span>
          <span className="sb-nav-label">{item.label}</span>
        </Link>
        <button
          type="button"
          className="sb-nav-expand"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? `Collapse ${item.label}` : `Expand ${item.label}`}
        >
          <span className={clsx("sb-nav-expand-chevron", !open && "is-closed")}>
            <ChevronDown size={13} strokeWidth={2.2} />
          </span>
        </button>
      </div>
      {/* Same transform-based reveal as NavSection — no per-frame height layout. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="subitems"
            initial={{ opacity: 0, y: motionOff ? 0 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: motionOff ? 0 : -6 }}
            transition={{ duration: motionOff ? 0 : 0.16, ease: EASE_OUT }}
            style={{ overflow: "hidden" }}
          >
            {children.map((child) => (
              <NavItemRow
                key={child.key}
                item={child}
                active={isNavActive(child.href, pathname)}
                collapsed={false}
                onClick={onClick}
                nested
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Nav item row ──────────────────────────────────────────────────────────

function NavItemRow({
  item,
  active,
  collapsed,
  onClick,
  nested = false,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
  nested?: boolean;
}) {
  const Icon = item.icon;
  const soon = item.badge === "soon";
  const motionOff = useMotionOff();

  const inner = (
    <>
      <span className="sb-nav-icon">
        <Icon size={17} strokeWidth={1.6} />
      </span>
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            key={`label-${item.key}`}
            className="sb-nav-label"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: motionOff ? 0 : 0.15, ease: EASE_OUT }}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!collapsed && item.badge && (
          <motion.span
            key={`badge-${item.key}`}
            className="sb-nav-badge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: motionOff ? 0 : 0.12 }}
          >
            {item.badge}
          </motion.span>
        )}
      </AnimatePresence>
      {!collapsed && active && !soon && (
        <span className="sb-nav-active-dot" aria-hidden="true" />
      )}
    </>
  );

  // Coming-soon entries render as inert rows (no href) so nothing 404s.
  if (soon) {
    return (
      <span
        className="sb-nav-item sb-nav-item--soon"
        aria-disabled="true"
        title={collapsed ? `${item.label} (soon)` : undefined}
      >
        {inner}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className={clsx(
        "sb-nav-item",
        active && "sb-nav-item--active",
        nested && "sb-nav-item--child",
      )}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
    >
      {inner}
    </Link>
  );
}

// ── Brand icon ────────────────────────────────────────────────────────────

function NorthstarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* 4-pointed compass star — elongated cardinal points, tight inner vertices */}
      <path
        d="M12 1.5 L13.4 10.6 L22.5 12 L13.4 13.4 L12 22.5 L10.6 13.4 L1.5 12 L10.6 10.6 Z"
        fill="currentColor"
        fillOpacity="0.88"
      />
      <circle cx="12" cy="12" r="1.6" fill="rgba(255,255,255,0.22)" />
    </svg>
  );
}
