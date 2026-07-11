"use client";

// Thin, discoverable entry point — mirrors the useSettings() shim pattern.
// The single source of truth is <AuthProvider> (mounted in the root layout).
export { useAuthContext as useAuth } from "@/providers/AuthProvider";
export type { AuthResult, Profile } from "@/providers/AuthProvider";
