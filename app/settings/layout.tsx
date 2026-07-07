import type { ReactNode } from "react";
import { OsShell } from "@/components/os/OsShell";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <OsShell>{children}</OsShell>;
}
