"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import {
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Search,
  Bot,
  Brain,
  Zap,
  FlaskConical,
  Wrench,
  Globe,
  Rocket,
  Link2,
  Shield,
  Settings,
  ChevronLeft,
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
};

const PRIMARY_NAV: NavItem[] = [
  { key: "command",   label: "Command Center", icon: LayoutDashboard, href: "/labs" },
  { key: "portfolio", label: "Portfolio",       icon: BarChart3,       href: "/portfolio", badge: "soon" },
  { key: "markets",   label: "Markets",         icon: TrendingUp,      href: "/markets",   badge: "soon" },
  { key: "research",  label: "Research",        icon: Search,          href: "/research",  badge: "soon" },
  { key: "agents",    label: "Agents",          icon: Bot,             href: "/agents",    badge: "soon" },
  { key: "memory",    label: "Memory",          icon: Brain,           href: "/memory",    badge: "soon" },
  { key: "workflows", label: "Workflows",       icon: Zap,             href: "/workflows", badge: "soon" },
];

const LABS_NAV: NavItem[] = [
  { key: "experiments", label: "Experiments",      icon: FlaskConical, href: "/labs" },
  { key: "builder",     label: "Agent Builder",    icon: Wrench,       href: "/labs",        badge: "soon" },
  { key: "mcp",         label: "MCP Integrations", icon: Globe,        href: "/connections" },
  { key: "sandbox",     label: "Sandbox",          icon: Rocket,       href: "/labs",        badge: "soon" },
];

const SYSTEM_NAV: NavItem[] = [
  { key: "connections", label: "Connections", icon: Link2,    href: "/connections" },
  { key: "security",    label: "Security",    icon: Shield,   href: "/security",  badge: "soon" },
  { key: "settings",    label: "Settings",    icon: Settings, href: "/settings" },
];

const AGENT_STATUSES = [
  { label: "Research Agent",  status: "Active",     color: "#5bd6a8", pulse: true  },
  { label: "Strategist Agent",status: "Active",     color: "#5bd6a8", pulse: true  },
  { label: "Trader Agent",    status: "Monitoring", color: "#e2b17c", pulse: false },
  { label: "Memory Sync",     status: "Online",     color: "#6e8bff", pulse: true  },
  { label: "Broker",          status: "Connected",  color: "#5bd6a8", pulse: false },
];

// Shared easing curve (avoids type inference issues with string literals)
const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94];
const EASE_IN:  [number, number, number, number] = [0.55, 0.06, 0.68, 0.19];

export function OsSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

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

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="sb-mobile-trigger"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu size={18} strokeWidth={1.8} />
      </button>

      {/* Desktop sidebar */}
      <motion.aside
        className={clsx("sb", { "sb--collapsed": collapsed })}
        animate={{ width: collapsed ? 64 : 280 }}
        transition={{ duration: 0.22, ease: EASE_OUT }}
        aria-label="Primary navigation"
      >
        <SidebarContent
          collapsed={collapsed}
          pathname={pathname}
          onToggle={toggle}
          onMobileClose={() => setMobileOpen(false)}
        />
      </motion.aside>

      {/* Mobile overlay + drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="sb-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="sb sb--mobile"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.22, ease: EASE_OUT }}
              aria-label="Primary navigation"
            >
              <SidebarContent
                collapsed={false}
                pathname={pathname}
                onToggle={() => setMobileOpen(false)}
                onMobileClose={() => setMobileOpen(false)}
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
  mobile = false,
}: {
  collapsed: boolean;
  pathname: string;
  onToggle: () => void;
  onMobileClose: () => void;
  mobile?: boolean;
}) {
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
              transition={{ duration: 0.16, ease: EASE_OUT }}
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

      {/* System status indicator */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            key="status-top"
            className="sb-status-top"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: EASE_IN }}
          >
            <span className="sb-status-dot sb-status-dot--online" />
            <span className="sb-status-label">All Systems Operational</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sb-divider" />

      {/* Scrollable nav */}
      <nav className="sb-nav" aria-label="OS Navigation">
        <NavSection
          items={PRIMARY_NAV}
          collapsed={collapsed}
          pathname={pathname}
          onClick={mobile ? onMobileClose : undefined}
        />

        <div className="sb-divider" />

        <NavSection
          label="Northstar Labs"
          items={LABS_NAV}
          collapsed={collapsed}
          pathname={pathname}
          onClick={mobile ? onMobileClose : undefined}
          experimental
        />

        <div className="sb-divider" />

        <NavSection
          label="System"
          items={SYSTEM_NAV}
          collapsed={collapsed}
          pathname={pathname}
          onClick={mobile ? onMobileClose : undefined}
        />
      </nav>

      {/* Bottom mission-control status panel */}
      <div className="sb-bottom">
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              key="status-panel"
              className="sb-status-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: EASE_OUT }}
            >
              <div className="sb-status-agents">
                {AGENT_STATUSES.map((a) => (
                  <div key={a.label} className="sb-status-row">
                    <span className="sb-status-name">{a.label}</span>
                    <span
                      className="sb-status-badge"
                      style={{ "--dot-color": a.color } as React.CSSProperties}
                    >
                      <span
                        className={clsx(
                          "sb-status-pulse",
                          a.pulse && "sb-status-pulse--blink",
                        )}
                      />
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="sb-divider" style={{ marginTop: 10 }} />

              <div className="sb-portfolio">
                <div className="sb-portfolio-label">Portfolio Value</div>
                <div className="sb-portfolio-value">$124,502</div>
                <div className="sb-portfolio-change">
                  <span className="sb-portfolio-delta">+2.34%</span>
                  <span className="sb-portfolio-period">today</span>
                </div>
              </div>
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
            transition={{ duration: 0.22, ease: EASE_OUT }}
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
                transition={{ duration: 0.14, ease: EASE_OUT }}
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

// ── Nav section ───────────────────────────────────────────────────────────

function NavSection({
  label,
  items,
  collapsed,
  pathname,
  onClick,
  experimental = false,
}: {
  label?: string;
  items: NavItem[];
  collapsed: boolean;
  pathname: string;
  onClick?: () => void;
  experimental?: boolean;
}) {
  return (
    <div className="sb-nav-section">
      <AnimatePresence>
        {label && !collapsed && (
          <motion.div
            key={`label-${label}`}
            className={clsx(
              "sb-section-label",
              experimental && "sb-section-label--exp",
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
      {items.map((item) => (
        <NavItemRow
          key={item.key}
          item={item}
          active={
            item.href === "/labs"
              ? pathname === "/labs"
              : pathname === item.href || pathname.startsWith(item.href + "/")
          }
          collapsed={collapsed}
          onClick={onClick}
        />
      ))}
    </div>
  );
}

// ── Nav item row ──────────────────────────────────────────────────────────

function NavItemRow({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={clsx("sb-nav-item", active && "sb-nav-item--active")}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
    >
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
            transition={{ duration: 0.15, ease: EASE_OUT }}
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
            transition={{ duration: 0.12 }}
          >
            {item.badge}
          </motion.span>
        )}
      </AnimatePresence>
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
