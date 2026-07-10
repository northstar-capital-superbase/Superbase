"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { ACCENTS, THEMES, type AccentKey, type ThemeName } from "./types";

// ── Section card ─────────────────────────────────────────────────────────────
export function SettingsSection({
  id,
  title,
  description,
  icon,
  actions,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className="lx-card lx-set-section">
      <header className="lx-set-head">
        <div className="lx-set-head-main">
          {icon && <span className="lx-set-icon">{icon}</span>}
          <div>
            <h2 className="lx-set-title">{title}</h2>
            {description && <p className="lx-set-sub">{description}</p>}
          </div>
        </div>
        {actions && <div className="lx-set-actions">{actions}</div>}
      </header>
      <div className="lx-set-body">{children}</div>
    </section>
  );
}

// ── Setting row (label + control) ────────────────────────────────────────────
export function Row({
  title,
  description,
  children,
  stack,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  stack?: boolean;
}) {
  return (
    <div className={clsx("lx-row", stack && "stack")}>
      <div className="lx-row-info">
        <div className="lx-row-title">{title}</div>
        {description && <div className="lx-row-desc">{description}</div>}
      </div>
      <div className="lx-row-control">{children}</div>
    </div>
  );
}

// ── Segmented control ────────────────────────────────────────────────────────
export interface SegOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: SegOption<T>[];
  ariaLabel?: string;
}) {
  return (
    <div className="lx-seg" role="radiogroup" aria-label={ariaLabel}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className={clsx("lx-seg-btn", value === o.value && "is-active")}
          onClick={() => onChange(o.value)}
        >
          <span className="lx-seg-label">{o.label}</span>
          {o.hint && <span className="lx-seg-hint">{o.hint}</span>}
        </button>
      ))}
    </div>
  );
}

// ── Toggle switch ────────────────────────────────────────────────────────────
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={clsx("lx-toggle", checked && "on")}
      onClick={() => onChange(!checked)}
    >
      <span className="lx-toggle-knob" />
    </button>
  );
}

// ── Number field ─────────────────────────────────────────────────────────────
export function NumberField({
  value,
  onChange,
  prefix,
  suffix,
  min = 0,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  prefix?: string;
  suffix?: string;
  min?: number;
  step?: number;
}) {
  return (
    <div className="lx-num">
      {prefix && <span className="lx-num-affix">{prefix}</span>}
      <input
        type="number"
        className="lx-num-input"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        step={step}
        onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
      />
      {suffix && <span className="lx-num-affix suf">{suffix}</span>}
    </div>
  );
}

// ── Slider ───────────────────────────────────────────────────────────────────
export function Slider({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  ariaLabel?: string;
}) {
  const idx = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div className="lx-slider" role="group" aria-label={ariaLabel}>
      <input
        type="range"
        className="lx-slider-input"
        min={0}
        max={options.length - 1}
        step={1}
        value={idx}
        aria-label={ariaLabel}
        aria-valuetext={options[idx]?.label}
        onChange={(e) => onChange(options[Number(e.target.value)]?.value ?? value)}
      />
      {/* Visual duplicates of the range positions; the input above is the
          accessible control, so these stay out of the tab order. */}
      <div className="lx-slider-ticks" aria-hidden="true">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            tabIndex={-1}
            className={clsx("lx-slider-tick", value === o.value && "on")}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Select ───────────────────────────────────────────────────────────────────
export function SelectRow<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  ariaLabel?: string;
}) {
  return (
    <div className="lx-select">
      <select
        className="lx-select-input"
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <svg className="lx-select-caret" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

// ── Theme swatch grid ────────────────────────────────────────────────────────
export function ThemeSwatchGrid({
  value,
  onChange,
}: {
  value: ThemeName;
  onChange: (v: ThemeName) => void;
}) {
  return (
    <div className="lx-themes" role="radiogroup" aria-label="Theme">
      {THEMES.map((t) => (
        <button
          key={t.name}
          type="button"
          role="radio"
          aria-checked={value === t.name}
          className={clsx("lx-theme-card", value === t.name && "on")}
          onClick={() => onChange(t.name)}
        >
          <span
            className="lx-theme-swatch"
            style={{ background: t.preview.bg }}
            aria-hidden="true"
          >
            <span className="lx-theme-bar" style={{ background: t.preview.surface }} />
            <span className="lx-theme-dot" style={{ background: t.preview.accent }} />
            <span className="lx-theme-line" style={{ background: t.preview.text }} />
            <span className="lx-theme-check">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12.5l5.5 5.5L20 6.5" />
              </svg>
            </span>
          </span>
          <span className="lx-theme-meta">
            <span className="lx-theme-name">{t.label}</span>
            <span className="lx-theme-hint">{t.hint}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Accent swatches ──────────────────────────────────────────────────────────
export function AccentPicker({
  value,
  onChange,
}: {
  value: AccentKey;
  onChange: (v: AccentKey) => void;
}) {
  return (
    <div className="lx-swatches">
      {ACCENTS.map((a) => (
        <button
          key={a.key}
          type="button"
          aria-label={a.label}
          aria-pressed={value === a.key}
          title={a.label}
          className={clsx("lx-swatch", a.key === "auto" && "auto", value === a.key && "on")}
          style={{ ["--sw"]: a.color } as React.CSSProperties}
          onClick={() => onChange(a.key)}
        />
      ))}
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────────────────
export type StatusState = "ok" | "warn" | "off" | "checking" | "unknown";

const STATE_COLOR: Record<StatusState, string> = {
  ok: "var(--green)",
  warn: "var(--gold)",
  off: "var(--text-4)",
  checking: "var(--blue-bright)",
  unknown: "var(--text-3)",
};

export function StatusBadge({
  state,
  label,
}: {
  state: StatusState;
  label: string;
}) {
  return (
    <span className="lx-badge">
      <span
        className={clsx(
          "lx-dot",
          (state === "checking" || state === "warn") && "lx-pulse",
        )}
        style={{
          background: STATE_COLOR[state],
          boxShadow: state === "ok" ? "0 0 8px var(--green)" : "none",
        }}
      />
      {label}
    </span>
  );
}

// ── Key/value grid (system info, memory stats) ───────────────────────────────
export function KeyValue({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <div className="lx-kv">
      {items.map((it) => (
        <div key={it.label} className="lx-kv-item">
          <span className="lx-kv-label">{it.label}</span>
          <span className="lx-kv-value">{it.value}</span>
        </div>
      ))}
    </div>
  );
}
