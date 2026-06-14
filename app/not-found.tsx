import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
      {/* Brand mark */}
      <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 shadow-glow-accent">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2l1.8 5.8 5.8 1.2-4.8 3.8 1.8 5.8-4.6-3.2-4.6 3.2 1.8-5.8L3.4 9l5.8-1.2L12 2z"
            fill="currentColor"
            className="text-accent"
          />
        </svg>
      </div>

      <div className="label-mono mb-3 text-slate-700">404 — Page not found</div>

      <h1 className="text-2xl font-semibold tracking-tight text-slate-100 md:text-3xl">
        This room doesn&apos;t exist.
      </h1>
      <p className="mt-3 max-w-sm text-body-md text-slate-500">
        The page you&apos;re looking for isn&apos;t part of Northstar OS yet, or it may have moved.
      </p>

      {/* Navigation options */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/dashboard" className="btn btn-primary">
          Go to Dashboard
        </Link>
        <Link href="/labs" className="btn btn-secondary">
          Open Labs
        </Link>
      </div>

      {/* Route map */}
      <div className="mt-10 w-full max-w-sm">
        <div className="label-mono mb-3 text-center text-slate-700">Available pages</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { href: "/dashboard", label: "Dashboard" },
            { href: "/trading", label: "Trading" },
            { href: "/labs", label: "Labs" },
            { href: "/agents", label: "Agents" },
            { href: "/research", label: "Research" },
            { href: "/memory", label: "Memory" },
            { href: "/portfolio", label: "Portfolio" },
            { href: "/analytics", label: "Analytics" },
            { href: "/settings", label: "Settings" },
            { href: "/tour", label: "Docs" },
          ].map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-[12px] text-slate-500 transition-colors hover:border-white/10 hover:text-slate-300"
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
