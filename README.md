# 🤖 AI Chatbot v2.0 — Local Multimodal AI Agent

A full-stack **ChatGPT-style AI assistant** built with **React, FastAPI, Ollama, SQLite, ChromaDB, and LLaVA**.

It supports **long-term memory, PDF RAG, image understanding, voice conversation, live web search, and source citations** — all running locally.

---

## ✨ Features

* 🧠 Long-term Memory Agent
* 💬 ChatGPT-style streaming conversations
* 🤖 Multi-model support (Qwen, Llama, Mistral & DeepSeek)
* 📄 PDF Retrieval-Augmented Generation (RAG)
* 🖼️ Image understanding with LLaVA
* 🎤 Speech-to-Text voice input
* 🔊 AI Text-to-Speech responses
* 🌐 Live Web Search Agent
* 🔗 Clickable source citations
* 💾 Persistent chat history (SQLite)
* ✏️ Rename & delete conversations
* 🌙 Modern ChatGPT-inspired dark UI

---

## 📸 Screenshots

### 💬 Chat Interface

![Chat Interface](screenshots/chat.png)

### 🧠 Long-Term Memory

The AI remembers user preferences and ongoing projects across conversations.

![Memory Sidebar](screenshots/memory.png)

### 🌐 Web Search with Citations

Live internet search with clickable source links.

![Web Search](screenshots/web-search.png)

### 🖼️ Vision (LLaVA)

Upload an image and let the AI describe its contents.

![Vision Demo](screenshots/vision.png)

---

## 🛠 Tech Stack

| Layer      | Technology                  |
| ---------- | --------------------------- |
| Frontend   | React + Vite + Tailwind CSS |
| Backend    | FastAPI + SQLAlchemy        |
| Database   | SQLite                      |
| Vector DB  | ChromaDB                    |
| AI Models  | Ollama                      |
| Vision     | LLaVA 7B                    |
| Embeddings | Nomic Embed Text            |

---

## 🤖 Supported Models

* **Qwen 2.5** *(Default)*
* Llama 3.2
* Mistral 7B
* DeepSeek R1
* LLaVA 7B (Vision)

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/bjayshbasu/AI-Chatbot.git
cd AI-Chatbot
```

### 2. Start the Backend

```bash
cd chatbot-api

python3 -m venv .venv
source .venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

### 3. Start the Frontend

```bash
cd chatbot-ui

npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

## 📂 Project Structure

```text
AI-Chatbot/
│
├── chatbot-api/
│   ├── main.py
│   ├── memory.py
│   ├── database.py
│   ├── models.py
│   ├── rag/
│   ├── tools/
│   └── vector_db/
│
├── chatbot-ui/
│   ├── src/
│   ├── components/
│   └── App.jsx
│
├── screenshots/
│   ├── chat.png
│   ├── memory.png
│   ├── web-search.png
│   └── vision.png
│
└── README.md
```

---

## 🧠 Version History

| Version  | Features                                  |
| -------- | ----------------------------------------- |
| **V1.1** | Local AI chatbot + SQLite                 |
| **V1.2** | Multi-model support + Regenerate response |
| **V1.3** | PDF RAG + Vision (LLaVA)                  |
| **V1.4** | Voice conversation (STT + TTS)            |
| **V1.5** | Web Search Agent                          |
| **V1.6** | Clickable source citations                |
| **V2.0** | Long-term Memory Agent                    |

---

## 🎯 Key Highlights

* Fully local AI powered by Ollama
* Persistent long-term memory
* PDF document question answering
* Image understanding with LLaVA
* Voice conversations
* Live web search with citations
* Streaming responses
* Modern ChatGPT-style interface

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 👨‍💻 Author

**Basu**

Built using React, FastAPI & Ollama.
