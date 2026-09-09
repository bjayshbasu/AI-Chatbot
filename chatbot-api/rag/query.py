from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

DB_DIR = "vector_db"

embedding = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

def search_docs(question: str, k: int = 5):
    # Re-open the database every query
    db = Chroma(
        persist_directory=DB_DIR,
        embedding_function=embedding,
    )

    docs = db.similarity_search(question, k=k)

    print(f"Retrieved {len(docs)} chunks")

    if not docs:
        return ""

    return "\n\n".join(doc.page_content for doc in docs)