from ollama import chat

def choose_tool(question: str) -> str:
    prompt = f"""
You are an AI tool router.

Choose ONLY one tool.

MEMORY = personal preferences, previous conversations, user profile

PDF = questions about uploaded documents, PDFs, files, reports, manuals, contracts, or requests to summarize a document

WEB = latest news, today's events, current information

GENERAL = everything else

Reply with ONLY one word:
MEMORY
PDF
WEB
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