import { useRef } from "react";

function ImageUpload() {
  const inputRef = useRef();

  const uploadImage = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", "Describe this image");

    const res = await fetch("http://127.0.0.1:8000/vision", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    alert(`🖼️ Vision Result:\n\n${data.response}`);
  };

  return (
    <>
      <button
        onClick={() => inputRef.current.click()}
        className="bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-sm"
      >
        🖼️ Image
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => uploadImage(e.target.files[0])}
      />
    </>
  );
}

export default ImageUpload;