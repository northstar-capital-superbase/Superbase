"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { Button } from "@/components/ui";
import {
  AccentPicker,
  Row,
  Segmented,
  SettingsSection,
  Slider,
  ThemeSwatchGrid,
  Toggle,
} from "./controls";
import { applyAppearance, useSettingsContext } from "./SettingsProvider";
import { DEFAULT_APPEARANCE, THEMES, type AppearanceSettings } from "./types";

const PaintGlyph = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <circle cx="8.5" cy="10" r="1.2" fill="currentColor" />
    <circle cx="15.5" cy="10" r="1.2" fill="currentColor" />
    <circle cx="12" cy="15" r="1.2" fill="currentColor" />
  </svg>
);

// Isolated preview: applies the *pending* appearance to a scoped container so
// the user sees the exact result before committing globally.
function LivePreview({ draft }: { draft: AppearanceSettings }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ref.current) applyAppearance(ref.current, draft);
  }, [draft]);

  const themeLabel =
    THEMES.find((t) => t.name === draft.theme)?.label ?? draft.theme;

  return (
    <div className="ap-preview-wrap">
      <div className="ap-preview-head">
        <span className="ap-preview-title">Live preview</span>
        <span className="ap-preview-badge">{themeLabel}</span>
      </div>
      <div ref={ref} className="ap-preview">
        <div className="ap-pv-bg" aria-hidden="true" />
        <aside className="ap-pv-rail">
          <span className="ap-pv-brand">
            <span className="ap-pv-brand-mark" />
            {draft.sidebar === "expanded" && <span className="ap-pv-brand-name">Northstar</span>}
          </span>
          <span className={clsx("ap-pv-navitem", "on")} />
          <span className="ap-pv-navitem" />
          <span className="ap-pv-navitem" />
        </aside>
        <div className="ap-pv-main">
          <div className="ap-pv-topbar">
            <span className="ap-pv-pill" />
            <span className="ap-pv-pill sm" />
          </div>
          <div className="ap-pv-thread">
            <div className="ap-pv-bubble user">Design me a launch plan.</div>
            <div className="ap-pv-bubble ai">
              Here is a sequenced plan with risks flagged and a decisive next step.
            </div>
          </div>
          <div className="ap-pv-agents">
            <span className="ap-pv-agent a1">Research</span>
            <span className="ap-pv-agent a2">Strategist</span>
            <span className="ap-pv-agent a3">Behavioral</span>
          </div>
          <div className="ap-pv-composer">
            <span className="ap-pv-composer-text">Ask the crew…</span>
            <span className="ap-pv-send" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AppearancePanel() {
  const { settings, replaceAppearance, ready } = useSettingsContext();
  const applied = settings.appearance;
  const [draft, setDraft] = useState<AppearanceSettings>(applied);

  // Keep the draft in sync when the applied appearance changes elsewhere
  // (e.g. reset from the General section) and there are no local edits.
  const dirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(applied),
    [draft, applied],
  );
  const prevApplied = useRef(applied);
  useEffect(() => {
    if (JSON.stringify(prevApplied.current) !== JSON.stringify(applied)) {
      setDraft(applied);
      prevApplied.current = applied;
    }
  }, [applied]);

  const set = <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  if (!ready) return null;

  return (
    <div className="ap-layout">
      <div className="ap-controls">
        <SettingsSection
          id="appearance"
          title="Appearance"
          description="Make Northstar yours. Edits preview instantly — Apply to save."
          icon={PaintGlyph}
        >
          <Row title="Theme" description="Eight hand-tuned palettes for the OS surfaces." stack>
            <ThemeSwatchGrid value={draft.theme} onChange={(theme) => set("theme", theme)} />
          </Row>
          <Row title="Accent color" description="Used across controls, highlights, and glows. Auto follows the theme.">
            <AccentPicker value={draft.accent} onChange={(accent) => set("accent", accent)} />
          </Row>
          <Row title="Corner radius" description="From crisp to fully rounded." stack>
            <Slider
              ariaLabel="Corner radius"
              value={draft.radius}
              onChange={(v) => set("radius", v as AppearanceSettings["radius"])}
              options={[
                { value: "sharp", label: "Sharp" },
                { value: "default", label: "Default" },
                { value: "round", label: "Round" },
              ]}
            />
          </Row>
          <Row title="Density" description="How tightly content is packed." stack>
            <Segmented
              ariaLabel="Density"
              value={draft.density}
              onChange={(v) => set("density", v)}
              options={[
                { value: "compact", label: "Compact" },
                { value: "cozy", label: "Cozy" },
                { value: "comfortable", label: "Comfortable" },
              ]}
            />
          </Row>
          <Row title="Font size" description="Scales the reading and composer text." stack>
            <Slider
              ariaLabel="Font size"
              value={draft.fontSize}
              onChange={(v) => set("fontSize", v as AppearanceSettings["fontSize"])}
              options={[
                { value: "small", label: "Small" },
                { value: "default", label: "Default" },
                { value: "large", label: "Large" },
              ]}
            />
          </Row>
          <Row title="Background style" description="Ambient glow, flat, or a faint grid." stack>
            <Segmented
              ariaLabel="Background style"
              value={draft.background}
              onChange={(v) => set("background", v)}
              options={[
                { value: "aurora", label: "Aurora" },
                { value: "solid", label: "Solid" },
                { value: "grid", label: "Grid" },
              ]}
            />
          </Row>
          <Row title="Chat bubbles" description="Style of the conversation surface." stack>
            <Segmented
              ariaLabel="Chat bubbles"
              value={draft.chatBubbles}
              onChange={(v) => set("chatBubbles", v)}
              options={[
                { value: "modern", label: "Modern" },
                { value: "minimal", label: "Minimal" },
                { value: "solid", label: "Solid" },
              ]}
            />
          </Row>
          <Row title="Sidebar" description="Default state of the navigation rail." stack>
            <Segmented
              ariaLabel="Sidebar"
              value={draft.sidebar}
              onChange={(v) => set("sidebar", v)}
              options={[
                { value: "expanded", label: "Expanded" },
                { value: "collapsed", label: "Collapsed" },
              ]}
            />
          </Row>
          <Row title="Glass effects" description="Frosted, translucent chrome on floating surfaces.">
            <Toggle label="Glass effects" checked={draft.glass} onChange={(v) => set("glass", v)} />
          </Row>
          <Row title="Agent colors" description="Tint agent chips by role, or keep them monochrome.">
            <Toggle label="Agent colors" checked={draft.agentColors} onChange={(v) => set("agentColors", v)} />
          </Row>
          <Row title="Animations" description="Micro-interactions and transitions across the OS.">
            <Toggle label="Animations" checked={draft.animations} onChange={(v) => set("animations", v)} />
          </Row>
          <Row title="Reduced motion" description="Minimize movement regardless of the animations setting.">
            <Toggle label="Reduced motion" checked={draft.reducedMotion} onChange={(v) => set("reducedMotion", v)} />
          </Row>
        </SettingsSection>
      </div>

      <div className="ap-preview-col">
        <LivePreview draft={draft} />
        <div className={clsx("ap-actions", dirty && "dirty")}>
          <span className="ap-actions-note">
            {dirty ? "Unsaved changes" : "All changes saved"}
          </span>
          <div className="ap-actions-btns">
            <Button
              onClick={() => setDraft(DEFAULT_APPEARANCE)}
              disabled={JSON.stringify(draft) === JSON.stringify(DEFAULT_APPEARANCE)}
            >
              Reset
            </Button>
            <Button onClick={() => setDraft(applied)} disabled={!dirty}>
              Discard
            </Button>
            <Button variant="primary" onClick={() => replaceAppearance(draft)} disabled={!dirty}>
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
