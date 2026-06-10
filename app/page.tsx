import type { Metadata } from "next";
import { NorthstarShowcase } from "@/components/showcase/NorthstarShowcase";

export const metadata: Metadata = {
  title: "Northstar OS — Autonomous Finance",
  description:
    "The operating system for autonomous finance. Capital routed and put to work, automatically.",
};

export default function Page() {
  return <NorthstarShowcase />;
}
