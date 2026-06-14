import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — Northstar OS",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
