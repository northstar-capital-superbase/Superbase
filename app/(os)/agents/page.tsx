import type { Metadata } from "next";
import { AgentsDirectory } from "@/components/agents/AgentsDirectory";

export const metadata: Metadata = {
  title: "Agents — Northstar OS",
};

export default function AgentsPage() {
  return <AgentsDirectory />;
}
