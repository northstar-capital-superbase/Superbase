import type { ReactNode } from "react";
import type { NavIcon } from "./nav";

const paths: Record<NavIcon, ReactNode> = {
  home: (
    <path
      d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="13" y="3" width="8" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="13" y="10" width="8" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </>
  ),
  labs: (
    <path
      d="M9 3 3 9v12h6v-6h6v6h6V9l-6-6H9Z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  ),
  agents: (
    <>
      <circle cx="12" cy="8" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M5 20c0-3.3 3.1-5 7-5s7 1.7 7 5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </>
  ),
  research: (
    <path
      d="M6 4h9l5 5v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  ),
  trading: (
    <path
      d="M4 18V6m0 12h16M8 14l3-4 3 2 4-6"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  memory: (
    <>
      <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </>
  ),
  integrations: (
  <path
      d="M8 12h8M12 8v8M7.5 7.5 4 4m13 3.5L20 4M7.5 16.5 4 20m13-3.5L20 20"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path
        d="M12 2v2m0 16v2M2 12h2m16 0h2m-3.3-6.7-1.4 1.4M6.7 17.3l-1.4 1.4m0-12.8 1.4 1.4m10.6 10.6 1.4 1.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </>
  ),
};

export function NavIconSvg({ icon, className }: { icon: NavIcon; className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      {paths[icon]}
    </svg>
  );
}
