from duckduckgo_search import DDGS

def search_web(query: str, max_results: int = 5):
    results = []

    with DDGS() as ddgs:
        for r in ddgs.text(query, max_results=max_results):
            results.append({
                "title": r["title"],
                "body": r["body"],
                "href": r["href"]
            })

    return results


def format_results(results):
    if not results:
        return "No web results found."

    text = ""
    for i, r in enumerate(results, 1):
        text += (
            f"{i}. {r['title']}\n"
            f"{r['body']}\n"
            f"Source: {r['href']}\n\n"
        )

    return text