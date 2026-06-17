import type { ReactNode } from "react";
import { OsSidebar } from "@/components/os/OsSidebar";
import "./labs-layout.css";

export default function LabsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lx-os-shell">
      <OsSidebar />
      <div className="lx-os-main">{children}</div>
    </div>
  );
}
