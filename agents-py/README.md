# Northstar Labs — CrewAI module (optional)

The main lab runs entirely inside Next.js and needs no Python. This folder is
the **CrewAI-native** counterpart: the same four roles
(Orchestrator / Research / Strategist / Behavioral) wired through the CrewAI
runtime, for experimenting with CrewAI's process model directly.

```bash
cd agents-py
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

export ANTHROPIC_API_KEY=...        # or OPENAI_API_KEY
python crew.py "Design a go-to-market plan for a local-first AI note app"
```

Unlike the Next.js lab, this module needs a real API key (CrewAI has no mock
mode). For a zero-config run, use the web app instead: `npm run dev`.
