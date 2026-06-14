import type { Metadata } from "next";
import { MemoryPageClient } from "@/components/memory/MemoryPageClient";

export const metadata: Metadata = {
  title: "Memory — Northstar OS",
};

export default function MemoryPage() {
  return <MemoryPageClient />;
}
