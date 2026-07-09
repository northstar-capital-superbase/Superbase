import type { Metadata } from "next";
import { AuthExperience } from "@/components/auth/AuthExperience";

export const metadata: Metadata = {
  title: "Northstar OS — Sign in",
  description: "Securely continue to your Northstar OS workspace.",
};

export default function LoginPage() {
  return <AuthExperience />;
}
