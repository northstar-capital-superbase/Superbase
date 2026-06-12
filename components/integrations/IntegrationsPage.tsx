"use client";

import { PageHeader } from "@/components/os/PageHeader";
import { Integrations } from "@/components/dashboard/Integrations";

export function IntegrationsPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        eyebrow="Integrations"
        title="Connections"
        description="LLM, memory, Robinhood MCP, and platform diagnostics."
      />
      <Integrations />
    </div>
  );
}
