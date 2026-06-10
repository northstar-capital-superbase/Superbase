import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Northstar Labs — Multi-Agent OS",
  description:
    "A local-first experimental multi-agent AI operating system by Northstar.",
};

export default function LabsPage() {
  return <Dashboard />;
}
