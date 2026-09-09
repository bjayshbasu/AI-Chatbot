import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";

function App() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [selectedModel, setSelectedModel] = useState("qwen2.5:3b");


  useEffect(() => {
    async function loadChats() {
      const res = await fetch("http://127.0.0.1:8000/chats");
      const data = await res.json();

      if (data.length > 0) {
        setChats(data);
        setActiveChat(data[0].id);
      } else {
        const firstChat = {
          id: Date.now(),
          title: "New Chat",
          messages: [
            {
              role: "assistant",
              text: "Hi! I'm your local AI.",
            },
          ],
        };

        setChats([firstChat]);
        setActiveChat(firstChat.id);
      }
    }

    loadChats();
  }, []);

const currentChat = chats.find(
  c => (c.id ?? c.tempId) === activeChat
);
function updateMessages(messages) {
  setChats(prev =>
    prev.map(chat =>
      (chat.id ?? chat.tempId) === activeChat
        ? { ...chat, messages }
        : chat
    )
  );
}

 function createChat() {
  const newChat = {
    id: null,
    tempId: Date.now(),
    title: "New Chat",
    messages: [
      {
        role: "assistant",
        text: "Hi! I'm your local AI.",
      },
    ],
  };

  setChats(prev => [...prev, newChat]);
  setActiveChat(newChat.tempId);
}
async function deleteChat(id) {
  await fetch(`http://127.0.0.1:8000/chat/${id}`, {
    method: "DELETE",
  });

  const remaining = chats.filter((chat) => chat.id !== id);

  setChats(remaining);

  if (remaining.length > 0) {
    setActiveChat(remaining[0].id ?? remaining[0].tempId);
  } else {
    createChat();
  }
}
async function renameChat(id, title) {
  await fetch(`http://127.0.0.1:8000/chat/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

   setChats((prev) =>
    prev.map((chat) =>
      chat.id === id ? { ...chat, title } : chat
    )
  );
}   // ← Add this closing brace

if (!currentChat) return null;
  return (
  <div className="flex h-screen bg-[#343541] text-white overflow-hidden">
    <Sidebar
  chats={chats}
  activeChat={activeChat}
  setActiveChat={setActiveChat}
  createChat={createChat}
  deleteChat={deleteChat}
  renameChat={renameChat}
/>

    <div className="flex flex-col flex-1 min-w-0">
      {/* Model selector */}
      <div className="bg-[#202123] border-b border-gray-700 p-3">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="bg-[#343541] text-white px-3 py-2 rounded-lg"
        >
          <option value="qwen2.5:3b">Qwen 2.5</option>
          <option value="llama3.2:3b">Llama 3.2</option>
          <option value="mistral:7b">Mistral 7B</option>
          <option value="deepseek-r1:7b">DeepSeek R1</option>
        </select>
      </div>

      <ChatWindow
        activeChat={activeChat}
        messages={currentChat.messages}
        setMessages={updateMessages}
        chats={chats}
        setChats={setChats}
        selectedModel={selectedModel}
      />
    </div>
  </div>
);

}

export default App;