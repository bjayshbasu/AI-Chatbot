from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

embedding = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2"
)

db = Chroma(
    persist_directory="vector_db",
    embedding_function=embedding,
)

def search_docs(question: str):
    docs = db.similarity_search(question, k=4)

    return "\n\n".join(doc.page_content for doc in docs)