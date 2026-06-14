import type { Metadata } from "next";
import { TradingClient } from "@/components/trading/TradingClient";

export const metadata: Metadata = {
  title: "Trading — Northstar OS",
};

export default function TradingPage() {
  return <TradingClient />;
}
