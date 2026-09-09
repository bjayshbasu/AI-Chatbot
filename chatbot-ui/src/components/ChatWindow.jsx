import { useState } from "react";
import MessageBubble from "./MessageBubble";
import InputBox from "./InputBox";

function ChatWindow({
  activeChat,
  messages,
  setMessages,
  chats,
  setChats,
  selectedModel,
}) {
  const [loading, setLoading] = useState(false);

  async function sendMessage(text) {
    if (!text.trim()) return;

    const updatedMessages = [
      ...messages,
      { role: "user", text },
    ];

    setMessages(updatedMessages);
    setLoading(true);

    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
     body: JSON.stringify({
  model: selectedModel,
  messages: updatedMessages,
}),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let assistantText = "";

    setMessages([
      ...updatedMessages,
      { role: "assistant", text: "" },
    ]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      assistantText += decoder.decode(value);

      setMessages([
        ...updatedMessages,
        { role: "assistant", text: assistantText },
      ]);
    }

    const finalMessages = [
      ...updatedMessages,
      { role: "assistant", text: assistantText },
    ];

    setMessages(finalMessages);
    speak(assistantText);

    const saveRes = await fetch("http://127.0.0.1:8000/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: chats.find(c => (c.id ?? c.tempId) === activeChat)?.id,
        title:
          finalMessages.find(m => m.role === "user")?.text.slice(0, 30) ||
          "New Chat",
        messages: finalMessages,
      }),
    });

    const saved = await saveRes.json();

    setChats(prev =>
      prev.map(chat =>
        (chat.id ?? chat.tempId) === activeChat
          ? { ...chat, id: saved.id }
          : chat
      )
    );
    speak(assistantText);
setLoading(false);
  }
async function regenerateResponse() {
  // Must have at least one assistant message
  if (messages.length < 2) return;

  // Remove the last assistant reply
  const history = [...messages];
  if (history[history.length - 1].role === "assistant") {
    history.pop();
  }

  // Find the last user message
  const lastUser = [...history]
    .reverse()
    .find((m) => m.role === "user");

  if (!lastUser) return;

  setMessages(history);
  setLoading(true);

  const res = await fetch("http://127.0.0.1:8000/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: selectedModel,
      messages: history,
    }),
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let assistantText = "";

  setMessages([
    ...history,
    { role: "assistant", text: "" },
  ]);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    assistantText += decoder.decode(value);

    setMessages([
      ...history,
      { role: "assistant", text: assistantText },
    ]);
  }

  setLoading(false);
}
function speak(text) {
  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel(); // stop previous speech

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 1;
  utterance.pitch = 1;

  window.speechSynthesis.speak(utterance);
}
  function handleUpload(file) {
    setMessages([
      ...messages,
      {
        role: "assistant",
        text: `📄 **${file.name}** uploaded successfully!\n\n${file.chunks} chunks indexed and ready for questions.`,
      },
    ]);
  }

  return (
  <div className="flex flex-col flex-1 min-h-0">
    {/* Scrollable messages */}
    <div className="flex-1 overflow-y-auto p-8 space-y-6 min-h-0">
      {messages.map((msg, i) => (
        <MessageBubble key={i} role={msg.role} text={msg.text} />
      ))}

      {loading && (
        <MessageBubble
          role="assistant"
          text="AI is typing..."
        />
      )}
    </div>

    {/* Fixed regenerate button */}
    {messages.length > 1 && !loading && (
      <div className="px-8 py-2 border-t border-gray-700">
        <button
          onClick={regenerateResponse}
          className="text-sm px-4 py-2 rounded-lg bg-[#40414F] hover:bg-[#4B4C5A]"
        >
          ↻ Regenerate response
        </button>
      </div>
    )}

    {/* Fixed input */}
    <div className="border-t border-gray-700 p-4">
      <InputBox
        onSend={sendMessage}
        onUpload={handleUpload}
        loading={loading}
      />
    </div>
  </div>
);
}
export default ChatWindow;