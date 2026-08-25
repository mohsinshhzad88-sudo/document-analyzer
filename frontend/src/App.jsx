import Navbar from "./components/Navbar";
import { useState } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import SkeletonReport from "./components/SkeletonReport";
import UploadCard from "./components/UploadCard";
import ReportDashboard from "./components/ReportDashboard";
import DecisionReport from "./components/DecisionReport";
import Comparison from "./pages/Comparison";
import DecisionComparison from "./pages/DecisionComparison";
import TaxUpload from "./tax/TaxUpload";

function App() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [typeMessage, setTypeMessage] = useState("");
  const [languageMessage, setLanguageMessage] = useState("");
  const [report, setReport] = useState(null);
  const [Loading, setLoading] = useState(false);
  const [documentType, setDocumentType] = useState("Auto Detect");
  const [currentDocumentType, setCurrentDocumentType] = useState("");
  const [documentLanguage, setDocumentLanguage] = useState("Auto Detect");
  const [outputLanguage, setOutputLanguage] = useState("Same as Input");
  const [currentDocumentLanguage, setCurrentDocumentLanguage] = useState("");
  const [currentOutputLanguage, setCurrentOutputLanguage] = useState("");
  const [showComparison, setShowComparison] = useState(false);
  const [analysisMode, setAnalysisMode] = useState("document");
  const [comparisonMode, setComparisonMode] = useState("document");
  const [appMode, setAppMode] = useState("analysis");
  


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
      setTypeMessage(
        `📄 AI detected: ${data.documentType} (${data.documentTypeConfidence}% confidence)`
      );
    }

  } catch (error) {
    console.error(error);
    setMessage("Failed to detect document type.");
  }

};

const detectDocumentLanguage = async (selectedFile) => {

  const formData = new FormData();
  formData.append("document", selectedFile);

  try {

    const response = await fetch(
      `${API_URL}/api/detect-language`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    console.log(data);

    if (data.success) {
      setDocumentLanguage(data.language);
      setLanguageMessage(
        `🌍 AI detected: ${data.language} (${data.languageConfidence}% confidence)`
      );
    }

  } catch (error) {
    console.error(error);
    setLanguageMessage("Failed to detect language.");
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
    formData.append("documentLanguage", documentLanguage);
    formData.append("outputLanguage", outputLanguage);
    formData.append("analysisMode", analysisMode);

    console.log("Uploading type:", documentType);
    console.log("Uploading language:", documentLanguage);
    console.log("Uploading output language:", outputLanguage);
    console.log("Uploading analysis mode:", analysisMode);

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
            setCurrentDocumentType(data.documentType);
            setCurrentDocumentLanguage(data.documentLanguage);
            setCurrentOutputLanguage(data.outputLanguage);

      setLoading(false);


    } catch (error) {
      console.error(error);
      setMessage("Upload failed");
      setLoading(false);
    }

  };

  return (
  <div>
    <Navbar
      showComparison={showComparison}
      setShowComparison={setShowComparison}
      analysisMode={analysisMode}
      setAnalysisMode={setAnalysisMode}
      comparisonMode={comparisonMode}
      setComparisonMode={setComparisonMode}
      appMode={appMode}
      setAppMode={setAppMode}
    />

    {appMode === "tax" ? (
      <div className="container">
        <TaxUpload />
      </div>
    ) : (
      <>
        {!showComparison && (
          <div className="container">
            <UploadCard
              file={file}
              setFile={setFile}
              detectDocumentType={detectDocumentType}
              detectDocumentLanguage={detectDocumentLanguage}
              documentType={documentType}
              setDocumentType={setDocumentType}
              documentLanguage={documentLanguage}
              setDocumentLanguage={setDocumentLanguage}
              outputLanguage={outputLanguage}
              setOutputLanguage={setOutputLanguage}
              uploadFile={uploadFile}
              Loading={Loading}
            />

            {typeMessage && <h4>{typeMessage}</h4>}

            {languageMessage && <h4>{languageMessage}</h4>}

            {message && <h3>{message}</h3>}

            {Loading && <SkeletonReport />}

            {!Loading && report && (
              analysisMode === "decision" ? (
                <DecisionReport
                  report={report}
                  currentDocumentLanguage={currentDocumentLanguage}
                  currentOutputLanguage={currentOutputLanguage}
                />
              ) : (
                <ReportDashboard
                  report={report}
                  currentDocumentLanguage={currentDocumentLanguage}
                  currentOutputLanguage={currentOutputLanguage}
                  documentLanguage={documentLanguage}
                  analysisMode={analysisMode}
                />
              )
            )}
          </div>
        )}

        {showComparison && (
          comparisonMode === "decision"
            ? <DecisionComparison />
            : <Comparison />
        )}
      </>
    )}
  </div>
);

}

export default App;