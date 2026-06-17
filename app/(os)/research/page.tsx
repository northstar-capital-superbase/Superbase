import type { Metadata } from "next";
import { ResearchTerminal } from "@/components/research/ResearchTerminal";

export const metadata: Metadata = {
  title: "Research — Northstar OS",
};

export default function ResearchPage() {
  return <ResearchTerminal />;
}
