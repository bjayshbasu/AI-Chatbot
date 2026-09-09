from ollama import chat

from agents.memory_agent import run as memory_run
from agents.pdf_agent import run as pdf_run
from agents.research_agent import run as research_run


def plan_task(question: str):
    prompt = f"""
You are an AI orchestrator.

Agents:
MEMORY
PDF
RESEARCH
VISION

Return only comma-separated agent names.

Question:
{question}
"""

    response = chat(
        model="qwen2.5:3b",
        messages=[{"role":"user","content":prompt}]
    )

    return [
        a.strip().upper()
        for a in response["message"]["content"].split(",")
    ]


def execute_plan(question: str):

    agents = plan_task(question)

    context = {
        "memory":"",
        "pdf":"",
        "web":"",
        "sources":[]
    }

    if "MEMORY" in agents:
        context["memory"] = memory_run(question)

    if "PDF" in agents:
        context["pdf"] = pdf_run(question)

    if "RESEARCH" in agents:
        web, sources = research_run(question)
        context["web"] = web
        context["sources"] = sources

    context["agents"] = agents
    return context