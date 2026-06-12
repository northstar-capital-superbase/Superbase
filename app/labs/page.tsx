import type { Metadata } from "next";
import { LabsOperatingCore } from "@/components/labs/LabsOperatingCore";

export const metadata: Metadata = {
  title: "Northstar Labs — Operational Core",
  description:
    "The autonomous research and execution center of Northstar OS.",
};

export default function LabsPage() {
  return <LabsOperatingCore />;
}
