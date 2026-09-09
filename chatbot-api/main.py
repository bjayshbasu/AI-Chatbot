from database import engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import engine
from models import Base
from fastapi import HTTPException
from database import SessionLocal
from models import Chat
from fastapi.responses import StreamingResponse
from fastapi import UploadFile, File
from rag.ingest import ingest_pdf
from rag.query import search_docs
from fastapi import FastAPI, HTTPException, UploadFile, File
from tools.web_search import search_web, format_results
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

    # Search uploaded PDFs
    pdf_context = search_docs(user_question)


    web_context = ""
    results = []
    keywords = ["latest", "today", "current", "news", "recent", "2026"]

    if any(k in user_question.lower() for k in keywords):
        results = search_web(user_question)
        web_context = format_results(results)

    context = f"""
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

Use the PDF context if relevant.
Use the web results if available.
Otherwise answer from your general knowledge.

{context}
""",
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