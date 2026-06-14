import type { Metadata } from "next";
import { ResearchClient } from "@/components/research/ResearchClient";

export const metadata: Metadata = {
  title: "Research — Northstar OS",
};

export default function ResearchPage() {
  return <ResearchClient />;
}
