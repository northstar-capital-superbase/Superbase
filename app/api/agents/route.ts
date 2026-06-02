import { NextResponse } from "next/server";
import { listProfiles } from "@/lib/agents";
import { getProvider } from "@/lib/llm";
import { memoryBackend } from "@/lib/memory";

export const runtime = "nodejs";

// GET /api/agents — agent roster + active runtime config for the dashboard.
export async function GET() {
  const provider = getProvider();
  return NextResponse.json({
    agents: listProfiles(),
    runtime: {
      provider: provider.name,
      model: provider.model,
      memory: memoryBackend(),
    },
  });
}
