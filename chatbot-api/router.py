from ollama import chat

def choose_tool(question: str) -> str:
    prompt = f"""
You are an AI tool router.

Choose ONLY one tool.

MEMORY = personal preferences, previous conversations

PDF = uploaded documents, files, contracts, manuals

WEB = latest news, today's events, current information

RESEARCH = requests to research, analyze, compare, investigate, or create a detailed report

GENERAL = everything else

Reply with ONLY one word:
MEMORY
PDF
WEB
RESEARCH
GENERAL

User question:
{question}
"""

    response = chat(
        model="qwen2.5:3b",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return response["message"]["content"].strip().upper()