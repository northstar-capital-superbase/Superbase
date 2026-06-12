import type { Metadata } from "next";
import { LabsWorkspace } from "@/components/labs/LabsWorkspace";

export const metadata: Metadata = {
  title: "Labs — Northstar OS",
  description: "Northstar research and development center — multi-agent experiments.",
};

export default function LabsPage() {
  return <LabsWorkspace />;
}
