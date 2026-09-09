import { useState } from "react";
import MessageBubble from "./MessageBubble";
import FileUpload from "./FileUpload";
import ImageUpload from "./ImageUpload";
import VoiceInput from "./VoiceInput";

function ChatWindow({
  messages,
  setMessages,
  chats,
  setChats,
  activeChat,
  selectedModel,
}) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    const response = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: updated,
        model: selectedModel,
      }),
    });

    // NEW: Read agent timeline
    const agentsHeader = response.headers.get("X-Agents");
    const usedAgents = agentsHeader ? JSON.parse(agentsHeader) : [];

    const sourcesHeader = response.headers.get("X-Sources");
    const sources = sourcesHeader ? JSON.parse(sourcesHeader) : [];

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let aiText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      aiText += decoder.decode(value);

      setMessages([
        ...updated,
        {
          role: "assistant",
          text: aiText,
          agents: usedAgents,
          sources,
        },
      ]);
    }

    setLoading(false);

    // Save chat
    const current = chats.find((c) => (c.id ?? c.tempId) === activeChat);

    await fetch("http://127.0.0.1:8000/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: current?.id,
        title: current?.title || "New Chat",
        messages: [
          ...updated,
          {
            role: "assistant",
            text: aiText,
            agents: usedAgents,
            sources,
          },
        ],
      }),
    });
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            role={msg.role}
            text={msg.text}
            sources={msg.sources}
            agents={msg.agents}
          />
        ))}

        {loading && (
          <div className="text-gray-400 text-sm">Thinking...</div>
        )}
      </div>

      <div className="border-t border-gray-700 p-4 bg-[#202123]">
        <div className="flex gap-2 mb-3">
          <FileUpload />
          <ImageUpload />
          <VoiceInput onTranscript={setInput} />
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 bg-[#343541] rounded-lg px-4 py-3 outline-none"
            placeholder="Message AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            className="bg-emerald-600 hover:bg-emerald-700 px-5 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;