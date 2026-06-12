import type { Metadata } from "next";
import { MissionControl } from "@/components/mission/MissionControl";

export const metadata: Metadata = {
  title: "Dashboard — Northstar OS",
  description: "Mission control for the Northstar Financial Operating System.",
};

export default function DashboardPage() {
  return <MissionControl />;
}
