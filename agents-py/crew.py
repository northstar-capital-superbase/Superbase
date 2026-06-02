"""
Northstar Labs — optional CrewAI mirror of the TypeScript agent system.

The primary, always-on lab runs entirely inside Next.js (see /lib/agents) so it
works with zero Python setup. This module is the CrewAI-native counterpart for
experimenting with the same orchestrator/research/strategist/behavioral roles
using the CrewAI runtime and Claude/OpenAI.

Run:
    cd agents-py
    python -m venv .venv && source .venv/bin/activate
    pip install -r requirements.txt
    export ANTHROPIC_API_KEY=...      # or OPENAI_API_KEY
    python crew.py "Design a go-to-market plan for a local-first AI note app"
"""

from __future__ import annotations

import os
import sys


def build_llm():
    """Pick an LLM the same way the TS side does: Anthropic, then OpenAI."""
    if os.getenv("ANTHROPIC_API_KEY"):
        from crewai import LLM

        return LLM(
            model=os.getenv("ANTHROPIC_MODEL", "anthropic/claude-sonnet-4-6"),
        )
    if os.getenv("OPENAI_API_KEY"):
        from crewai import LLM

        return LLM(model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"))
    raise SystemExit(
        "No API key found. Set ANTHROPIC_API_KEY or OPENAI_API_KEY, or use the "
        "Next.js lab which has a built-in mock mode."
    )


def build_crew(task: str):
    from crewai import Agent, Crew, Process, Task

    llm = build_llm()

    research = Agent(
        role="Research",
        goal="Surface relevant facts, constraints, prior art, and open questions.",
        backstory="A rigorous analyst who separates known facts from assumptions.",
        llm=llm,
        verbose=True,
    )
    strategist = Agent(
        role="Strategist",
        goal="Turn research and goals into a concrete, sequenced plan of action.",
        backstory="A pragmatic planner who favors the smallest plan that makes progress.",
        llm=llm,
        verbose=True,
    )
    behavioral = Agent(
        role="Behavioral",
        goal="Pressure-test plans for risks, incentives, and human factors.",
        backstory="A sharp skeptic who spots failure modes and cognitive biases.",
        llm=llm,
        verbose=True,
    )
    orchestrator = Agent(
        role="Orchestrator",
        goal="Coordinate the specialists and synthesize one clear, actionable answer.",
        backstory="A decisive lead who integrates specialist work into a final recommendation.",
        llm=llm,
        verbose=True,
    )

    t_research = Task(
        description=f"Research the task: {task}",
        expected_output="Concise bullet points of facts, constraints, and unknowns.",
        agent=research,
    )
    t_strategy = Task(
        description=f"Using the research, build a sequenced plan for: {task}",
        expected_output="3-5 sequenced steps with the single most important next action.",
        agent=strategist,
        context=[t_research],
    )
    t_behavior = Task(
        description=f"Pressure-test the plan for risks and human factors: {task}",
        expected_output="Top failure modes plus one concrete mitigation.",
        agent=behavioral,
        context=[t_research, t_strategy],
    )
    t_synth = Task(
        description=f"Synthesize all specialist work into one answer for: {task}",
        expected_output="A direct recommendation, key supporting points, and the next step.",
        agent=orchestrator,
        context=[t_research, t_strategy, t_behavior],
    )

    return Crew(
        agents=[orchestrator, research, strategist, behavioral],
        tasks=[t_research, t_strategy, t_behavior, t_synth],
        process=Process.sequential,
        verbose=True,
    )


def main() -> None:
    task = " ".join(sys.argv[1:]).strip() or "Plan a 3-month roadmap for an open-source dev tool"
    crew = build_crew(task)
    result = crew.kickoff()
    print("\n\n=== Northstar Labs · CrewAI synthesis ===\n")
    print(result)


if __name__ == "__main__":
    main()
