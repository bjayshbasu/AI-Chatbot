from ollama import chat

from agents.memory_agent import run as memory_run
from agents.pdf_agent import run as pdf_run
from agents.research_agent import run as research_run


def plan_task(question: str):
    q = question.lower()

    # Rule-based routing (reliable)
    agents = []

    if any(word in q for word in [
        "pdf", "document", "booklet", "uploaded",
        "summarize", "summary"
    ]):
        agents.append("PDF")

    if any(word in q for word in [
        "news", "research", "latest", "today",
        "current", "web"
    ]):
        agents.append("RESEARCH")

    if any(word in q for word in [
        "remember", "favorite", "my ", "memory"
    ]):
        agents.append("MEMORY")

    # Fallback to LLM only if nothing matched
    if not agents:
        prompt = f"""
You are an AI orchestrator.

Available agents:
MEMORY
PDF
RESEARCH
VISION

Return only comma-separated agent names.

Question: {question}
"""
        response = chat(
            model="qwen2.5:3b",
            messages=[{"role": "user", "content": prompt}],
        )

        agents = [
            a.strip().upper()
            for a in response["message"]["content"].split(",")
        ]

    return agents


def execute_plan(question: str):
    agents = plan_task(question)

    context = {
        "memory": "",
        "pdf": "",
        "web": "",
        "sources": [],
        "agents": agents,
    }

    if "MEMORY" in agents:
        context["memory"] = memory_run(question)

    if "PDF" in agents:
        context["pdf"] = pdf_run(question)

    if "RESEARCH" in agents:
        web, sources = research_run(question)
        context["web"] = web
        context["sources"] = sources

    return context