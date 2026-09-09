from tools.web_search import search_web, format_results
from ollama import chat

def deep_research(question: str):

    # Remove research command words
    topic = question.lower()

    for word in ["research", "investigate", "analyze", "study"]:
        topic = topic.replace(word, "")

    topic = topic.strip().title()

    searches = [
        topic,
        f"{topic} statistics",
        f"{topic} latest research"
    ]

    all_results = []
    context = ""

    for query in searches:
        results = search_web(query)

        if results:
            all_results.extend(results)
            context += format_results(results) + "\n\n"

    prompt = f"""
Write a professional research report.

Topic: {topic}

Structure:
1. Introduction
2. Key Findings
3. Statistics
4. Conclusion

Use ONLY the information below.

{context}
"""

    response = chat(
        model="qwen2.5:3b",
        messages=[
            {"role": "user", "content": prompt}
        ]
    )
    unique = {}

    for r in all_results:
        unique[r["href"]] = r

    all_results = list(unique.values())

    return response["message"]["content"], [
        {
            "title": r["title"],
            "href": r["href"]
        }
        for r in all_results[:6]
    ]