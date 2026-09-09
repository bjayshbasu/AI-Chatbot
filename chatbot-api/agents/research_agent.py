from tools.web_search import search_web, format_results

def run(question: str):
    results = search_web(question)
    return format_results(results), results