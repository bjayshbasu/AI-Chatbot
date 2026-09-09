import { useState, useRef, useEffect } from "react";
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

  const bottomRef = useRef(null);

  // ✅ Auto scroll whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

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

    const agents = JSON.parse(
      response.headers.get("X-Agents") || "[]"
    );

    const sources = JSON.parse(
      response.headers.get("X-Sources") || "[]"
    );

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
          agents,
          sources,
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Scrollable chat */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            role={msg.role}
            text={msg.text}
            agents={msg.agents}
            sources={msg.sources}
            streaming={
              loading &&
              i === messages.length - 1 &&
              msg.role === "assistant"
            }
          />
        ))}

        {loading && (
          <div className="text-gray-400 text-sm animate-pulse">
            Thinking...
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Fixed composer */}
      <div className="shrink-0 border-t border-gray-700 bg-[#202123] p-4">
        <div className="flex gap-2 mb-3">
          <FileUpload
  onUpload={(file) => {
    setMessages([
      ...messages,
      {
        role: "assistant",
        text: `📄 **${file.name}** uploaded successfully!\n\n${file.chunks} chunks indexed and ready for questions.`,
      },
    ]);
  }}
/>
          <ImageUpload />
          <VoiceInput onTranscript={setInput} />
        </div>

        <div className="flex gap-2">
          <input
            className="flex-1 bg-[#343541] rounded-lg px-4 py-3 outline-none text-white"
            placeholder="Message AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && sendMessage()
            }
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