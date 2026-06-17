export type NavIcon =
  | "home"
  | "dashboard"
  | "labs"
  | "agents"
  | "research"
  | "trading"
  | "memory"
  | "integrations"
  | "settings";

export interface OsNavItem {
  href: string;
  label: string;
  description: string;
  icon: NavIcon;
  /** Shown in mobile bottom bar (max 5). */
  mobilePrimary?: boolean;
}

export const OS_NAV: OsNavItem[] = [
  {
    href: "/",
    label: "Home",
    description: "Northstar OS marketing & vision",
    icon: "home",
    mobilePrimary: true,
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    description: "Mission control — system overview",
    icon: "dashboard",
    mobilePrimary: true,
  },
  {
    href: "/labs",
    label: "Labs",
    description: "Research & development center",
    icon: "labs",
    mobilePrimary: true,
  },
  {
    href: "/agents",
    label: "Agents",
    description: "Agent roster & capabilities",
    icon: "agents",
  },
  {
    href: "/research",
    label: "Research",
    description: "Market intelligence terminal",
    icon: "research",
  },
  {
    href: "/trading",
    label: "Trading",
    description: "Portfolio & execution",
    icon: "trading",
    mobilePrimary: true,
  },
  {
    href: "/memory",
    label: "Memory",
    description: "Shared knowledge & timeline",
    icon: "memory",
  },
  {
    href: "/integrations",
    label: "Integrations",
    description: "Connections & diagnostics",
    icon: "integrations",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Environment & policy",
    icon: "settings",
    mobilePrimary: true,
  },
];

export const MOBILE_NAV = OS_NAV.filter((n) => n.mobilePrimary);
