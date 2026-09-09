from database import engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import engine
from models import Base
from fastapi import HTTPException
from database import SessionLocal
from models import Chat
from fastapi.responses import StreamingResponse, FileResponse
from fastapi import UploadFile, File
from rag.ingest import ingest_pdf
from rag.query import search_docs
from fastapi import FastAPI, HTTPException, UploadFile, File
from tools.web_search import search_web, format_results
from memory import extract_memory, get_memories
from router import choose_tool
from research import deep_research
from pdf_export import create_pdf
import json

Base.metadata.create_all(bind=engine)
class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    messages: list
    model: str = "qwen2.5:3b"
class RenameChat(BaseModel):
    title: str
class ChatResponse(BaseModel):
    answer: str
    sources: list = []
class ExportRequest(BaseModel):
    title: str
    content: str
from ollama import chat
import base64

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Sources"],   # ← ADD THIS LINE
)

class Message(BaseModel):
    text: str

@app.post("/chat")
def chat_endpoint(request: ChatRequest):

    user_question = request.messages[-1]["text"]
    extract_memory(user_question)

        # Search uploaded PDFs
    if "summarize" in user_question.lower():
        pdf_context = search_docs("document")
    else:
        pdf_context = search_docs(user_question)

    memory_context = "\n".join(get_memories())

    tool = choose_tool(user_question)
    print(f"🛠 Tool Selected: {tool}")

    web_context = ""
    results = []

    if tool == "WEB":
        results = search_web(user_question)
        web_context = format_results(results)

    if tool == "RESEARCH":
        report, research_sources = deep_research(user_question)

        def generate():
            yield report

        return StreamingResponse(
            generate(),
            media_type="text/plain",
            headers={
                "X-Sources": json.dumps(research_sources)
        },
    )

    if tool == "MEMORY":
        memory_context = "\n".join(get_memories())

    if tool == "PDF":
        pdf_context = search_docs(user_question)

    context = f"""
Long-term Memory:
{memory_context}

PDF Context:
{pdf_context}

Web Results:
{web_context}
"""

    conversation = [
        {
            "role": "system",
            "content": f"""
You are a helpful AI assistant.

If PDF Context is provided, answer ONLY using that document.
If Web Results are provided, use them for current information.
Otherwise answer from general knowledge.
Never ask the user to upload the PDF if PDF Context already exists.

{context}
"""
        }
    ]

    conversation += [
        {"role": m["role"], "content": m["text"]}
        for m in request.messages
    ]

    def generate():
        stream = chat(
            model=request.model,
            messages=conversation,
            stream=True,
        )

        for chunk in stream:
            yield chunk["message"]["content"]

    return StreamingResponse(
        generate(),
        media_type="text/plain",
        headers={
            "X-Sources": json.dumps(results if web_context else [])
        },
    )
@app.get("/chats")
def get_chats():
    db = SessionLocal()
    chats = db.query(Chat).all()

    result = [
        {
            "id": c.id,
            "title": c.title,
            "messages": json.loads(c.messages)
        }
        for c in chats
    ]

    db.close()
    return result

@app.get("/memories")
def get_memory_list():
    return get_memories(20)

@app.post("/save")
def save_chat(chat_data: dict):
    db = SessionLocal()

    chat_id = chat_data.get("id")

    if chat_id:
        chat = db.query(Chat).filter(Chat.id == chat_id).first()

        if chat:
            chat.title = chat_data["title"]
            chat.messages = json.dumps(chat_data["messages"])
            db.commit()

            saved_id = chat.id      # Save before closing
            db.close()

            return {"id": saved_id}

    new_chat = Chat(
        title=chat_data["title"],
        messages=json.dumps(chat_data["messages"])
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    saved_id = new_chat.id         # Save before closing
    db.close()

    return {"id": saved_id}

@app.delete("/chat/{chat_id}")
def delete_chat(chat_id: int):
    db = SessionLocal()

    chat = db.query(Chat).filter(Chat.id == chat_id).first()

    if not chat:
        db.close()
        raise HTTPException(status_code=404, detail="Chat not found")

    db.delete(chat)
    db.commit()
    db.close()

    return {"success": True}


@app.put("/chat/{chat_id}")
def rename_chat(chat_id: int, data: RenameChat):
    db = SessionLocal()

    chat = db.query(Chat).filter(Chat.id == chat_id).first()

    if not chat:
        db.close()
        raise HTTPException(status_code=404, detail="Chat not found")

    chat.title = data.title
    db.commit()
    db.close()

    return {"success": True}

import tempfile
import os

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # Save uploaded PDF temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
        temp.write(await file.read())
        temp_path = temp.name

    # Ingest into ChromaDB
    ingest_pdf(temp_path)

    # Clean up temp file
    os.remove(temp_path)

    return {
    "message": "PDF uploaded successfully",
    "chunks": "Indexed"
}
@app.post("/export-report")
def export_report(data: ExportRequest):

    filename = "research_report.pdf"

    create_pdf(
        data.title,
        data.content,
        filename
    )

    return FileResponse(
        filename,
        media_type="application/pdf",
        filename=filename
    )
@app.post("/vision")
async def vision_chat(
    file: UploadFile = File(...),
    prompt: str = "Describe this image",
):
    image_bytes = await file.read()
    image_b64 = base64.b64encode(image_bytes).decode("utf-8")

    response = chat(
        model="llava:7b",
        messages=[
            {
                "role": "user",
                "content": prompt,
                "images": [image_b64],
            }
        ],
    )

    return {"response": response["message"]["content"]}