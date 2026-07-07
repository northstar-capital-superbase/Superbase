import type { ReactNode } from "react";
import { OsShell } from "@/components/os/OsShell";

export default function ConnectionsLayout({ children }: { children: ReactNode }) {
  return <OsShell>{children}</OsShell>;
}
