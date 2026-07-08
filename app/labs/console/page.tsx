import type { Metadata } from "next";
import { LabConsole } from "@/components/labs/LabConsole";

export const metadata: Metadata = {
  title: "Lab Console — Northstar Labs",
  description: "Chat-first multi-agent Lab Console.",
};

export default function LabConsolePage() {
  return <LabConsole />;
}
