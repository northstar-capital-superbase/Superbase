import type { Metadata } from "next";
import { AgentsClient } from "@/components/agents/AgentsClient";

export const metadata: Metadata = {
  title: "Agents — Northstar OS",
};

export default function AgentsPage() {
  return <AgentsClient />;
}
