"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button, type ButtonProps } from "@/components/ui/Button";

// Secure logout: destroys the Supabase session, clears local per-user UI
// state, then returns to /login. Shared by the sidebar and Settings so
// sign-out behaves identically everywhere it appears.
export function SignOutButton({ children, ...rest }: Omit<ButtonProps, "onClick">) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    setBusy(true);
    try {
      await signOut();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <Button onClick={onClick} loading={busy} {...rest}>
      {children ?? "Sign out"}
    </Button>
  );
}
