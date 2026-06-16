import type { Metadata } from "next";
import { Settings } from "@/components/settings/Settings";

export const metadata: Metadata = {
  title: "Settings — Northstar OS",
  description:
    "Configure AI models, memory, trading controls, integrations, and appearance.",
};

export default function SettingsPage() {
  return <Settings />;
}
