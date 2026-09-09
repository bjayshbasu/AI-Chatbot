function FileUpload({ onUpload }) {
  async function uploadFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:8000/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    onUpload({
      name: file.name,
      chunks: data.chunks,
    });
  }

  return (
    <label className="cursor-pointer bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-600">
      📎
      <input
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={uploadFile}
      />
    </label>
  );
}

export default FileUpload;