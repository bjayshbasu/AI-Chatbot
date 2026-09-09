import { useRef, useState } from "react";

function FileUpload({ onUpload }) {
  const inputRef = useRef();
  const [dragging, setDragging] = useState(false);

  async function uploadFile(file) {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (onUpload) {
      onUpload({
        name: file.name,
        chunks: data.chunks,
      });
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        uploadFile(e.dataTransfer.files[0]);
      }}
      className={`rounded-full border transition ${
        dragging
          ? "border-emerald-500 bg-emerald-900/20"
          : "border-gray-600"
      }`}
    >
      <button
        onClick={() => inputRef.current.click()}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-700"
      >
        📎
      </button>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        hidden
        onChange={(e) => uploadFile(e.target.files[0])}
      />
    </div>
  );
}

export default FileUpload;