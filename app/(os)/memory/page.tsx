import type { Metadata } from "next";
import { MemoryWorkspace } from "@/components/memory/MemoryWorkspace";

export const metadata: Metadata = {
  title: "Memory — Northstar OS",
};

export default function MemoryPage() {
  return <MemoryWorkspace />;
}
