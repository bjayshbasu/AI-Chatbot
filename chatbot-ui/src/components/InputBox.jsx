import { useState, useRef } from "react";
import FileUpload from "./FileUpload";

function InputBox({ onSend, onUpload, loading }) {
  const [input, setInput] = useState("");
  const imageRef = useRef(null);
  const [listening, setListening] = useState(false);
const recognitionRef = useRef(null);
  function handleSend() {
    if (!input.trim() || loading) return;

    onSend(input);
    setInput("");
  }
  async function uploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("prompt", "Describe this image");

  const res = await fetch("http://127.0.0.1:8000/vision", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  onSend(`🖼️ ${file.name}`);
  onSend(data.response);
}
function startListening() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Speech recognition is not supported in this browser.");
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onstart = () => setListening(true);

  recognition.onend = () => setListening(false);

  recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;

  setInput(transcript);

  // Send automatically
  onSend(transcript);
  setInput("");
};

  recognitionRef.current = recognition;
  recognition.start();
}
  return (
    <div className="p-6 border-t border-gray-700">
      <div className="flex bg-[#40414F] rounded-xl px-4 py-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder="Message your AI..."
          className="flex-1 bg-transparent outline-none text-white placeholder-gray-400"
        />

 <div className="flex items-center gap-2 ml-3">
  <FileUpload onUpload={onUpload} />

  <input
    ref={imageRef}
    type="file"
    accept="image/*"
    className="hidden"
    onChange={(e) => {
      if (e.target.files?.[0]) {
        uploadImage(e.target.files[0]);
      }
    }}
  />

  <button
    onClick={() => imageRef.current.click()}
    className="text-xl"
  >
    🖼️
  </button>

  <button
    onClick={handleSend}
    disabled={loading}
    className="bg-[#10A37F] w-10 h-10 rounded-full text-white hover:opacity-90 disabled:opacity-50"
  >
    ↑
  </button>
  <button
  onClick={startListening}
  className={`text-xl ${listening ? "text-red-400" : "text-white"}`}
>
  🎤
</button>
</div>
        
      </div>
    </div>
  );
}

export default InputBox;