import { useState } from "react";
import "./App.css";
import SkeletonReport from "./components/SkeletonReport";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [summary, setSummary] = useState("");
  const [Loading, setLoading] = useState(false);

  const uploadFile = async () => {
    if (!file) {
      setMessage("Please select a file first");
      return;
    }

        setLoading(true);
        setMessage("");
        setSummary("");

    const formData = new FormData();
    formData.append("document", file);

    try {
      const response = await fetch(
          "https://document-analyzer-two.vercel.app/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      setMessage(data.message);
      setSummary(data.summary);

      setLoading(false);


    } catch (error) {
      console.error(error);
      setMessage("Upload failed");
      setLoading(false);
    }

  };

  return (
    <div style={{ padding: "40px" }}>
   <h1 style={{ color: "black" }}>Document Analyzer</h1> 


      <input
        id="fileInput"
        type="file"
        style={{display: "none"}}
        onChange={(e) => setFile(e.target.files[0])}
      />
 
        <label htmlFor="fileInput" className="file-button">
              {file ? file.name : "📂 Choose Document"}
        </label>

      <br /><br />

      <button onClick={uploadFile} disabled={Loading}>
        {Loading? "Analyzing..." : "Upload Document"}
      </button>

      <h3>{message}</h3>
      
  {Loading && <SkeletonReport />}

{!Loading && summary && (
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