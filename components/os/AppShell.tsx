"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { SidebarNav } from "./SidebarNav";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "./CommandPalette";

function StarLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2l2.2 6.6L21 11l-6.8 2.4L12 22l-2.2-8.6L3 11l6.8-2.4L12 2z"
        fill="currentColor"
      />
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  return (
    <>
      <div className="flex min-h-[100dvh] bg-base-900">
        {/* Desktop sidebar */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-white/5 bg-base-850/50 lg:flex">
          <div className="flex h-14 items-center gap-2.5 border-b border-white/5 px-4">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent">
              <StarLogo />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Northstar</div>
              <div className="font-mono text-[9px] uppercase tracking-[0.14em] text-slate-600">
                Financial OS
              </div>
            </div>
          </div>
          <SidebarNav />
          <div className="mt-auto border-t border-white/5 p-3">
            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              className="flex w-full items-center justify-between rounded-lg border border-white/5 bg-base-750/40 px-3 py-2 text-[12px] text-slate-400 transition hover:border-accent/30"
            >
              <span>Command</span>
              <kbd className="font-mono text-[10px] text-slate-600">⌘K</kbd>
            </button>
          </div>
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-base-900/70 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            />
            <aside className="relative flex h-full w-[min(280px,85vw)] flex-col border-r border-white/5 bg-base-850 shadow-2xl">
              <div className="flex h-14 items-center justify-between border-b border-white/5 px-4">
                <span className="text-sm font-semibold text-white">Northstar</span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-lg px-2 py-1 text-slate-400"
                >
                  ✕
                </button>
              </div>
              <SidebarNav onNavigate={() => setDrawerOpen(false)} />
            </aside>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-white/5 bg-base-900/80 px-4 backdrop-blur-md lg:px-6">
            <button
              type="button"
              className="rounded-lg border border-white/5 p-2 text-slate-400 lg:hidden"
              aria-label="Open menu"
              onClick={() => setDrawerOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
              <div className="grid h-7 w-7 place-items-center rounded-md bg-accent/15 text-accent">
                <StarLogo />
              </div>
              <span className="text-sm font-semibold text-white">Northstar</span>
            </Link>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaletteOpen(true)}
                className="rounded-lg border border-white/5 px-2.5 py-1.5 text-[12px] text-slate-500 lg:hidden"
              >
                ⌘K
              </button>
              <Link
                href="/labs"
                className="hidden rounded-lg bg-accent px-3 py-1.5 text-[12px] font-medium text-base-900 sm:inline-flex"
              >
                Open Labs
              </Link>
            </div>
          </header>

          <main className="os-page flex-1 overflow-y-auto pb-20 lg:pb-6">
            <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6">{children}</div>
          </main>
        </div>
      </div>

      <MobileNav />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
