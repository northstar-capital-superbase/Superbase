import type { Metadata } from "next";
import { SettingsPage } from "@/components/settings/SettingsPage";

export const metadata: Metadata = {
  title: "Settings — Northstar OS",
  description: "Platform settings, developer tools, and integration diagnostics.",
};

export default function Page() {
  return <SettingsPage />;
}
