import type { Metadata } from "next";
import { SettingsPanel } from "@/components/settings/SettingsPanel";

export const metadata: Metadata = {
  title: "Settings — Northstar OS",
};

export default function SettingsPage() {
  return <SettingsPanel />;
}
