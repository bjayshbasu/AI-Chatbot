import { useState } from "react";

function VoiceInput({ onTranscript }) {
  const [listening, setListening] = useState(false);

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    setListening(true);

    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  return (
    <button
      onClick={startListening}
      className={`px-3 py-2 rounded-lg text-sm ${
        listening
          ? "bg-red-600 animate-pulse"
          : "bg-gray-700 hover:bg-gray-600"
      }`}
    >
      {listening ? "🎙 Listening..." : "🎤 Voice"}
    </button>
  );
}

export default VoiceInput;