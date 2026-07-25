import { useState } from "react";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState("");

  const uploadFile = async () => {
    if (!file) {
      setMessage("Please select a file first");
      return;
    }

    const formData = new FormData();

    formData.append("document", file);

    try {
      const response = await fetch(
        "http://localhost:5000/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      setMessage(data.message);
      setSummary(data.summary);

    } catch (error) {
      console.error(error);
      setMessage("Upload failed");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Document Analyzer</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={uploadFile}>
        Upload Document
      </button>

      <h3>{message}</h3>
      
      {summary && (
  <div style={{ marginTop: "20px" }}>
    <h2>AI Analysis</h2>
    <pre
      style={{
        whiteSpace: "pre-wrap",
        textAlign: "left",
        background: "#f5f5f5",
        padding: "15px",
        borderRadius: "8px",
      }}
    >
      {summary}
    </pre>
  </div>
)}
      
    </div>
  );
}

export default App;