from database import engine, SessionLocal
from sqlalchemy import Column, Integer, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text)

Base.metadata.create_all(bind=engine)


def save_memory(text: str):
    db = SessionLocal()
    memory = Memory(content=text)
    db.add(memory)
    db.commit()
    db.close()


def get_memories(limit: int = 10):
    db = SessionLocal()
    memories = db.query(Memory).order_by(Memory.id.desc()).limit(limit).all()
    db.close()
    return [m.content for m in memories]
from ollama import chat

from ollama import chat

def extract_memory(user_message: str):
    prompt = f"""
You are an AI memory extractor.

Convert the user's message into ONE short memory.

Examples:
Input: My name is Basu
Output: User's name is Basu

Input: I prefer dark mode
Output: User prefers dark mode

Input: I'm building an AI chatbot
Output: User is building an AI chatbot

If the message is casual or not useful, reply ONLY: NONE

User message:
{user_message}
"""

    response = chat(
        model="qwen2.5:3b",
        messages=[{"role": "user", "content": prompt}]
    )

    memory = response["message"]["content"].strip()

    if memory == "NONE":
        return

    existing = get_memories(100)

    if memory not in existing:
        save_memory(memory)