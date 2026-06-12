"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { MOBILE_NAV } from "./nav";
import { NavIconSvg } from "./icons";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-base-900/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      aria-label="Mobile"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-1">
        {MOBILE_NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px]",
                active ? "text-accent" : "text-slate-500",
              )}
            >
              <NavIconSvg icon={item.icon} className="h-[18px] w-[18px]" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
