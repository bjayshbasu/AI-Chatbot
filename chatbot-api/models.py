from sqlalchemy import Column, Integer, String, Text
from database import Base

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True)
    title = Column(String)
    messages = Column(Text)