import { useEffect, useState } from "react";

function Sidebar({
  chats,
  activeChat,
  setActiveChat,
  createChat,
  deleteChat,
  renameChat,
}) {
  const [editingId, setEditingId] = useState(null);
const [editTitle, setEditTitle] = useState("");
const [memories, setMemories] = useState([]);

const loadMemories = () => {
  fetch("http://127.0.0.1:8000/memories")
    .then(res => res.json())
    .then(setMemories);
};

useEffect(() => {
  loadMemories();
}, []);

return (
    <div className="w-64 bg-[#202123] p-4 flex flex-col">
      <button
        onClick={createChat}
        className="border border-gray-600 rounded-lg py-3 hover:bg-gray-700"
      >
        + New Chat
      </button>

      <div className="mt-4 space-y-2 overflow-y-auto">
  {chats.map(chat => (
  <div
    key={chat.id ?? chat.tempId}
    className={`flex items-center justify-between p-3 rounded-lg ${
      (chat.id ?? chat.tempId) === activeChat
        ? "bg-[#343541]"
        : "hover:bg-[#2A2B32]"
    }`}
  >
    
   {editingId === chat.id ? (
  <input
    autoFocus
    value={editTitle}
    onChange={(e) => setEditTitle(e.target.value)}
    onBlur={() => setEditingId(null)}
    onKeyDown={async (e) => {
      if (e.key === "Enter") {
        await renameChat(chat.id, editTitle);
        setEditingId(null);
      }
    }}
    className="flex-1 bg-[#40414F] text-white px-2 rounded outline-none"
  />
) : (
  <div
    className="flex-1 cursor-pointer truncate"
    onClick={() => setActiveChat(chat.id ?? chat.tempId)}
  >
    {chat.title}
  </div>
)}
{chat.id && (
  <button
    onClick={() => {
      setEditingId(chat.id);
      setEditTitle(chat.title);
    }}
    className="text-gray-400 hover:text-white mr-1"
  >
    ✏️
  </button>
)}
    {chat.id && (
      <button
        onClick={() => deleteChat(chat.id)}
        className="text-gray-400 hover:text-red-400 ml-2"
      >
        🗑
      </button>
    )}
  </div>
))}
           </div>

      {/* 🧠 Memories */}
      <div className="mt-6 border-t border-gray-700 pt-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">
          🧠 Memories
        </h3>

        <div className="space-y-2">
          {memories.map((memory, i) => (
            <div
              key={i}
              className="text-xs bg-[#2A2B32] rounded-lg p-2 text-gray-300"
            >
              {memory}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

export default Sidebar;