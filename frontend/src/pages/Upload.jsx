import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [url, setUrl] = useState("");

  const uploadFile = () => {
    const formData = new FormData();
    formData.append("video", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:3000/upload");

    xhr.upload.onprogress = (e) => {
      setProgress(Math.round((e.loaded * 100) / e.total));
    };

    xhr.onload = () => {
      const res = JSON.parse(xhr.response);
      setUrl(res.url);
    };

    xhr.send(formData);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📤 Upload Video</h2>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <button onClick={uploadFile}>Upload</button>

      {progress > 0 && <p>Progress: {progress}%</p>}

      {url && <a href={url}>{url}</a>}
    </div>
  );
}