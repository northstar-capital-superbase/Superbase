import { AppShell } from "@/components/os/AppShell";

export default function PlatformLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
