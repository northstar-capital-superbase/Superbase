export type NavIcon =
  | "dashboard"
  | "labs"
  | "agents"
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
    href: "/dashboard",
    label: "Dashboard",
    description: "Mission control — system overview",
    icon: "dashboard",
    mobilePrimary: true,
  },
  {
    href: "/labs",
    label: "Labs",
    description: "Multi-agent workspace",
    icon: "labs",
    mobilePrimary: true,
  },
  {
    href: "/agents",
    label: "Agents",
    description: "Agent roster & capabilities",
    icon: "agents",
    mobilePrimary: true,
  },
  {
    href: "/memory",
    label: "Memory",
    description: "Shared knowledge & timeline",
    icon: "memory",
    mobilePrimary: true,
  },
  {
    href: "/trading",
    label: "Trading",
    description: "Portfolio & execution",
    icon: "trading",
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
