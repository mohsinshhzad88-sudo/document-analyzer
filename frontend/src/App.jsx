import { useState } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import SkeletonReport from "./components/SkeletonReport";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [report, setReport] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState("Auto Detect");

   const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://document-analyzer-two.vercel.app";


const detectDocumentType = async (selectedFile) => {

  const formData = new FormData();
  formData.append("document", selectedFile);

  try {

    const response = await fetch(
      `${API_URL}/api/detect-type`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    console.log(data);

    if (data.success) {
      setDocumentType(data.documentType);
      setMessage(
        `AI detected: ${data.documentType} (${data.confidence}% confidence)`
      );
    }

  } catch (error) {
    console.error(error);
    setMessage("Failed to detect document type.");
  }

};


  const uploadFile = async () => {
    if (!file) {
      setMessage("Please select a file first");
      return;
    }

        setLoading(true);
        setMessage("");
       setReport(null);

    const formData = new FormData();
    formData.append("document", file);
    formData.append("documentType", documentType);

    try {
      const response = await fetch(
           `${API_URL}/api/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
            console.log(data);

            setMessage(data.message);
            setReport(data.report);

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
        onChange={(e) => {
          const selectedFile = e.target.files[0];
          if(!selectedFile) return;
          setFile(selectedFile);
          detectDocumentType(selectedFile);
        }}
      />
 
        <label htmlFor="fileInput" className="file-button">
              {file ? file.name : "📂 Choose Document"}
        </label>

      <br /><br />
      
<label><strong>Document Type</strong></label>
<br />

<select
  value={documentType}
  onChange={(e) => setDocumentType(e.target.value)}
>
  <option>Auto Detect</option>
  <option>Research Paper</option>
  <option>Resume / CV</option>
  <option>Legal Contract</option>
  <option>Business Report</option>
  <option>Financial Report</option>
  <option>Medical Report</option>
  <option>Story / Novel</option>
  <option>Meeting Minutes</option>
  <option>Technical Documentation</option>
  <option>Other</option>
</select>

<br />
      <button onClick={uploadFile} disabled={Loading}>
        {Loading? "Analyzing..." : "Upload Document"}
      </button>

      <h3>{message}</h3>
      


{Loading && <SkeletonReport />}

{!Loading && report && (
  <div
    style={{
      marginTop: "20px",
      background: "#ffffff",
      padding: "25px",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      textAlign: "left",
    }}
  >

    <h2 style={{ textAlign: "center" }}>
      📄 Document Audit Report
    </h2>

    <h3>Executive Summary</h3>
    <p>{report.executiveSummary}</p>


    <h3>Key Findings</h3>
<ul>
  {report.keyFindings?.map((item, index) => (
    <li key={index}>
      {typeof item === "object"
        ? item.finding || JSON.stringify(item)
        : item}
    </li>
  ))}
</ul>


<h3>Risks</h3>
<ul>
  {report.risks?.map((item, index) => (
    <li key={index}>
      {typeof item === "object"
        ? item.risk || JSON.stringify(item)
        : item}
    </li>
  ))}
</ul>


<h3>Recommendations</h3>
<ul>
  {report.recommendations?.map((item, index) => (
    <li key={index}>
      {typeof item === "object"
        ? item.recommendation || JSON.stringify(item)
        : item}
    </li>
  ))}
</ul>


    <h3>Overall Score</h3>
    <h1>
      {report.overallScore}/100
    </h1>


    <h3>Final Verdict</h3>
    <p>{report.finalVerdict}</p>

  </div>
)}

    </div>
  );
}

export default App;