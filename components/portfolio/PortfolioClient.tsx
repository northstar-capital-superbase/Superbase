"use client";

import clsx from "clsx";
import Link from "next/link";

const HOLDINGS = [
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Tech", shares: 24, price: 875.4, cost: 612.0, change: 2.3, value: 21_010, pct: 8.4, color: "#6d8bff" },
  { symbol: "AAPL", name: "Apple Inc.", sector: "Tech", shares: 85, price: 189.3, cost: 155.2, change: 0.4, value: 16_091, pct: 7.1, color: "#a78bfa" },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Tech", shares: 42, price: 415.2, cost: 310.0, change: 1.1, value: 17_438, pct: 6.9, color: "#34d399" },
  { symbol: "VOO", name: "Vanguard S&P 500 ETF", sector: "ETF", shares: 120, price: 512.8, cost: 420.0, change: 0.6, value: 61_536, pct: 24.3, color: "#22d3ee" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Tech", shares: 38, price: 182.7, cost: 148.0, change: -0.8, value: 6_943, pct: 5.5, color: "#fbbf24" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Tech", shares: 55, price: 156.8, cost: 140.0, change: 0.6, value: 8_624, pct: 4.9, color: "#f87171" },
  { symbol: "XLE", name: "Energy Select Sector SPDR", sector: "Energy", shares: 200, price: 88.4, cost: 82.0, change: 1.8, value: 17_680, pct: 7.0, color: "#e2b17c" },
  { symbol: "QQQM", name: "Invesco NASDAQ 100 ETF", sector: "ETF", shares: 180, price: 198.2, cost: 165.0, change: 0.9, value: 35_676, pct: 14.1, color: "#8892b0" },
];

const ALLOCATION_SECTORS = [
  { label: "Tech", pct: 32, color: "#6d8bff" },
  { label: "ETF", pct: 38, color: "#22d3ee" },
  { label: "Energy", pct: 7, color: "#e2b17c" },
  { label: "Other", pct: 23, color: "#5a6080" },
];

export function PortfolioClient() {
  const totalValue = 253_063;
  const totalCost = 198_420;
  const totalGain = totalValue - totalCost;
  const totalGainPct = ((totalGain / totalCost) * 100).toFixed(1);

  return (
    <div className="min-h-full px-4 py-6 md:px-6 md:py-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="label-mono mb-1.5 md:mb-2">Holdings</div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-100 md:text-heading-xl">
              Portfolio
            </h1>
            <p className="mt-1 text-body-sm text-slate-500 md:text-body-md">
              Full position breakdown, allocation analysis, and performance.
            </p>
          </div>
          <Link href="/trading" className="btn btn-secondary btn-sm flex-shrink-0">
            View AI decisions →
          </Link>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="panel p-3 md:p-4 col-span-2 md:col-span-1">
          <div className="label-mono mb-1">Total Value</div>
          <div className="tabular-nums text-xl font-semibold text-slate-100 md:text-2xl">
            ${totalValue.toLocaleString()}
          </div>
        </div>
        <div className="panel p-3 md:p-4">
          <div className="label-mono mb-1">Total Gain</div>
          <div className="tabular-nums text-xl font-semibold text-status-success md:text-2xl">
            +${totalGain.toLocaleString()}
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-status-success">+{totalGainPct}%</div>
        </div>
        <div className="panel p-3 md:p-4">
          <div className="label-mono mb-1">Positions</div>
          <div className="tabular-nums text-xl font-semibold text-slate-100 md:text-2xl">
            {HOLDINGS.length}
          </div>
        </div>
        <div className="panel p-3 md:p-4">
          <div className="label-mono mb-1">Cash</div>
          <div className="tabular-nums text-xl font-semibold text-slate-100 md:text-2xl">
            $23,418
          </div>
          <div className="mt-0.5 text-[11px] text-slate-600">2.8% of portfolio</div>
        </div>
      </div>

      {/* Allocation + Holdings grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr]">
        {/* Allocation sidebar */}
        <div className="panel p-4">
          <div className="label-mono mb-4">Allocation</div>
          {/* Bar */}
          <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
            {ALLOCATION_SECTORS.map((s) => (
              <div
                key={s.label}
                style={{ width: `${s.pct}%`, backgroundColor: s.color }}
                className="rounded-full"
              />
            ))}
          </div>
          {/* Legend */}
          <div className="mt-4 space-y-2.5">
            {ALLOCATION_SECTORS.map((s) => (
              <div key={s.label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 flex-shrink-0 rounded-sm" style={{ backgroundColor: s.color }} />
                  <span className="text-[12px] text-slate-400">{s.label}</span>
                </div>
                <span className="font-mono text-[12px] text-slate-500">{s.pct}%</span>
              </div>
            ))}
          </div>

          {/* Concentration warning */}
          <div className="mt-4 rounded-lg border border-status-warning/15 bg-status-warning/5 p-3 text-[11px] text-status-warning/90">
            NVDA at 8.4% exceeds 7% concentration limit. Behavioral agent recommends review.
          </div>
        </div>

        {/* Holdings table */}
        <div className="panel overflow-hidden">
          <div className="border-b border-white/[0.04] px-4 py-3">
            <div className="label-mono">All Positions</div>
          </div>

          {/* Mobile: card list */}
          <div className="divide-y divide-white/[0.04] sm:hidden">
            {HOLDINGS.map((h) => (
              <div key={h.symbol} className="flex items-center gap-3 p-3">
                <div
                  className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-[11px] font-bold"
                  style={{ backgroundColor: `${h.color}18`, color: h.color }}
                >
                  {h.symbol[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-[13px] font-semibold text-slate-200">{h.symbol}</span>
                    <span className="font-mono text-[12px] text-slate-300">
                      ${h.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[11px] text-slate-600">{h.pct}% of portfolio</span>
                    <span
                      className={clsx(
                        "font-mono text-[11px]",
                        h.change >= 0 ? "text-status-success" : "text-status-danger",
                      )}
                    >
                      {h.change >= 0 ? "+" : ""}{h.change}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-white/[0.04] text-left">
                  {["Symbol", "Name", "Shares", "Price", "Value", "Weight", "Today", "Gain"].map(
                    (col) => (
                      <th
                        key={col}
                        className="label-mono px-4 py-2.5 font-normal"
                      >
                        {col}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {HOLDINGS.map((h) => {
                  const gain = ((h.price - h.cost) / h.cost) * 100;
                  return (
                    <tr key={h.symbol} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: h.color }}
                          />
                          <span className="font-semibold text-slate-100">{h.symbol}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{h.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-400 tabular-nums">{h.shares}</td>
                      <td className="px-4 py-3 font-mono text-slate-300 tabular-nums">${h.price}</td>
                      <td className="px-4 py-3 font-mono text-slate-200 tabular-nums">
                        ${h.value.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-400 tabular-nums">{h.pct}%</td>
                      <td className="px-4 py-3 tabular-nums">
                        <span
                          className={clsx(
                            "font-mono",
                            h.change >= 0 ? "text-status-success" : "text-status-danger",
                          )}
                        >
                          {h.change >= 0 ? "+" : ""}{h.change}%
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums">
                        <span
                          className={clsx(
                            "font-mono",
                            gain >= 0 ? "text-status-success" : "text-status-danger",
                          )}
                        >
                          {gain >= 0 ? "+" : ""}{gain.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-white/[0.04] px-4 py-3 text-[11px] text-slate-700">
            Demo data — connect Robinhood to see live positions
          </div>
        </div>
      </div>
    </div>
  );
}
