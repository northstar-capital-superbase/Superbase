"use client";

// Thin compatibility shim. The single source of truth is <SettingsProvider>
// (mounted in the root layout) so theme/appearance apply on every route, not
// just after visiting /settings. Existing call sites keep the same API.
export { useSettingsContext as useSettings } from "./SettingsProvider";
