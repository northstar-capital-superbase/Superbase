import type { Metadata } from "next";
import { TradingConsole } from "@/components/trading/TradingConsole";

export const metadata: Metadata = {
  title: "Trading — Northstar OS",
};

export default function TradingPage() {
  return <TradingConsole />;
}
