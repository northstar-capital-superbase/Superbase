"use client";

import { useState } from "react";
import { LabsNav } from "@/components/labs/LabsNav";
import { DeveloperPanel } from "./DeveloperPanel";
import "@/components/showcase/showcase.css";
import "./settings.css";

type Tab = "general" | "developer";

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>("developer");

  return (
    <div className="settings-root ns-root">
      <LabsNav />

      <header className="settings-hero ns-view">
        <span className="ns-eyebrow">Northstar OS</span>
        <h1 className="settings-hero-title">Settings</h1>
        <p className="settings-hero-sub">
          Platform preferences and developer tooling. Operational work stays in
          Labs — configuration lives here.
        </p>
      </header>

      <div className="settings-body">
        <div className="settings-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            className={`settings-tab ${tab === "general" ? "is-active" : ""}`}
            onClick={() => setTab("general")}
          >
            General
          </button>
          <button
            type="button"
            role="tab"
            className={`settings-tab ${tab === "developer" ? "is-active" : ""}`}
            onClick={() => setTab("developer")}
          >
            Developer
          </button>
        </div>

        {tab === "general" && (
          <div className="settings-placeholder">
            General preferences — workspace defaults, notifications, and policy
            — ship in a future release. Use the Developer tab for runtime and
            integration diagnostics today.
          </div>
        )}

        {tab === "developer" && <DeveloperPanel />}
      </div>
    </div>
  );
}
