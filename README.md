# 🤖 AI Chatbot v2.0 — Local Multimodal AI Agent

A full-stack **ChatGPT-style AI assistant** built with **React, FastAPI, Ollama, SQLite, ChromaDB, and LLaVA**. It supports long-term memory, PDF RAG, image understanding, voice conversation, and live web search with source citations.

---

## ✨ Features

* 🧠 **Long-term Memory Agent** (persistent user memories)
* 💬 ChatGPT-style streaming conversations
* 🤖 Multi-model support (Qwen, Llama, Mistral, DeepSeek)
* 📄 PDF RAG with ChromaDB
* 🖼️ Image understanding using LLaVA
* 🎤 Speech-to-text voice input
* 🔊 AI text-to-speech replies
* 🌐 Live web search agent
* 🔗 Clickable source citations
* 💾 Persistent chat history (SQLite)
* ✏️ Rename & delete chats
* 🌙 Modern dark ChatGPT-inspired UI

---

## 🛠 Tech Stack

| Frontend       | Backend    | AI        |
| -------------- | ---------- | --------- |
| React + Vite   | FastAPI    | Ollama    |
| Tailwind CSS   | SQLite     | Qwen 2.5  |
| React Markdown | ChromaDB   | Llama 3.2 |
| Speech API     | SQLAlchemy | LLaVA 7B  |

---

## 🚀 Screenshots

> Add screenshots from your app here after uploading them to GitHub.

* Chat interface
* PDF RAG
* Voice mode
* Web search with citations
* Memory sidebar

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/bjayshbasu/AI-Chatbot.git
cd AI-Chatbot
```

### 2. Backend

```bash
cd chatbot-api

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend

```bash
cd ../chatbot-ui

npm install
npm run dev
```

---

## 🤖 Supported Models

* Qwen 2.5 (Default)
* Llama 3.2
* Mistral 7B
* DeepSeek R1
* LLaVA 7B (Vision)

---

## 🧠 Version Roadmap

| Version  | Features                 |
| -------- | ------------------------ |
| V1.1     | Local chatbot + SQLite   |
| V1.2     | Multi-model + Regenerate |
| V1.3     | PDF RAG + Vision         |
| V1.4     | Voice conversation       |
| V1.5     | Web Search Agent         |
| V1.6     | Source citations         |
| **V2.0** | Long-term Memory Agent   |

---

## 📂 Project Structure

```text
AI-Chatbot/
├── chatbot-api/
│   ├── main.py
│   ├── memory.py
│   ├── database.py
│   ├── models.py
│   ├── tools/
│   ├── rag/
│   └── vector_db/
│
├── chatbot-ui/
│   ├── src/
│   ├── components/
│   └── App.jsx
│
└── README.md
```

---

## 🎯 Highlights

This project demonstrates:

* Full-stack AI application development
* Retrieval-Augmented Generation (RAG)
* AI tool routing (Web + Memory + Vision)
* Streaming LLM responses
* Persistent long-term memory
* Modern React architecture
* FastAPI REST APIs

---

## 📄 License

MIT License

Built with ❤️ using React, FastAPI & Ollama.
