from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from pydantic import BaseModel
from database import engine, SessionLocal
from models import Base, Chat
from memory import extract_memory, get_memories
from agents.orchestrator import execute_plan
from rag.ingest import ingest_pdf
from pdf_export import create_pdf
from ollama import chat
import tempfile
import base64
import json
import os

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Sources"],
)

# ---------------- Models ---------------- #

class ChatRequest(BaseModel):
    messages: list
    model: str = "qwen2.5:3b"

class RenameChat(BaseModel):
    title: str

class ExportRequest(BaseModel):
    title: str
    content: str

# ---------------- CHAT ---------------- #

@app.post("/chat")
def chat_endpoint(request: ChatRequest):

    user_question = request.messages[-1]["text"]

    # Save memories
    extract_memory(user_question)

    # Multi-agent orchestrator
    ctx = execute_plan(user_question)

    memory_context = ctx["memory"]
    pdf_context = ctx["pdf"]
    web_context = ctx["web"]
    sources = ctx["sources"]
    agents = ctx["agents"]

    system_prompt = f"""
You are an autonomous multi-agent AI assistant.

Memory:
{memory_context}

PDF Context:
{pdf_context}

Web Research:
{web_context}

Instructions:
- Combine all available context naturally.
- Use Memory when relevant.
- Use PDF context if available.
- Use Web Research for current information.
- Never ask the user to upload a PDF if PDF context already exists.
"""

    conversation = [
        {
            "role": "system",
            "content": system_prompt,
        }
    ]

    conversation += [
        {
            "role": m["role"],
            "content": m["text"],
        }
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
            "X-Sources": json.dumps(sources),
            "X-Agents": json.dumps(agents),
        },
    )
# ---------------- CHAT HISTORY ---------------- #

@app.get("/chats")
def get_chats():
    db = SessionLocal()
    chats = db.query(Chat).all()

    result = [
        {
            "id": c.id,
            "title": c.title,
            "messages": json.loads(c.messages),
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
        chat_obj = db.query(Chat).filter(Chat.id == chat_id).first()

        if chat_obj:
            chat_obj.title = chat_data["title"]
            chat_obj.messages = json.dumps(chat_data["messages"])
            db.commit()
            saved_id = chat_obj.id
            db.close()
            return {"id": saved_id}

    new_chat = Chat(
        title=chat_data["title"],
        messages=json.dumps(chat_data["messages"]),
    )

    db.add(new_chat)
    db.commit()
    db.refresh(new_chat)

    saved_id = new_chat.id
    db.close()

    return {"id": saved_id}

@app.delete("/chat/{chat_id}")
def delete_chat(chat_id: int):
    db = SessionLocal()

    chat_obj = db.query(Chat).filter(Chat.id == chat_id).first()

    if not chat_obj:
        db.close()
        raise HTTPException(status_code=404, detail="Chat not found")

    db.delete(chat_obj)
    db.commit()
    db.close()

    return {"success": True}

@app.put("/chat/{chat_id}")
def rename_chat(chat_id: int, data: RenameChat):
    db = SessionLocal()

    chat_obj = db.query(Chat).filter(Chat.id == chat_id).first()

    if not chat_obj:
        db.close()
        raise HTTPException(status_code=404, detail="Chat not found")

    chat_obj.title = data.title
    db.commit()
    db.close()

    return {"success": True}

# ---------------- PDF UPLOAD ---------------- #

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
        temp.write(await file.read())
        temp_path = temp.name

    ingest_pdf(temp_path)
    os.remove(temp_path)

    return {
        "message": "PDF uploaded successfully",
        "chunks": "Indexed",
    }

# ---------------- PDF EXPORT ---------------- #

@app.post("/export-report")
def export_report(data: ExportRequest):

    filename = "research_report.pdf"

    create_pdf(
        data.title,
        data.content,
        filename,
    )

    return FileResponse(
        filename,
        media_type="application/pdf",
        filename=filename,
    )

# ---------------- VISION ---------------- #

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