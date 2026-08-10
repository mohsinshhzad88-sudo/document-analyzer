import React, { useState } from "react";
import ComparisonReport from "../components/comparison/ComparisonReport";
import "../components/comparison/ComparisonCards.css";
import UploadScreen from "../components/comparison/UploadScreen";
import LoadingScreen from "../components/comparison/LoadingScreen";

function Comparison() {
  const [referenceFile, setReferenceFile] = useState(null);
  const [referenceType, setReferenceType] = useState("");
  const [mainFile, setMainFile] = useState(null);
  const [evaluated, setEvaluated] = useState(false);
  const [result, setResult] = useState(null);
  const [referenceLanguage, setReferenceLanguage] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://document-analyzer-two.vercel.app";

  const evaluateDocument = async () => {
    setLoading(true);

    const formData = new FormData();

    formData.append("reference", referenceFile);
    formData.append("document", mainFile);
    formData.append("referenceType", referenceType);

    try {
      const response = await fetch(
        `${API_URL}/api/evaluate`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log(data);
      console.log("FULL RESULT:", data.result);
      console.log(
        "IMPROVEMENTS:",
        data.result?.priorityImprovements
      );

      setReferenceType(data.referenceType);
      setResult(data.result);
      setEvaluated(true);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const detectReference = async (file) => {
    const formData = new FormData();

    formData.append("document", file);
    formData.append("documentType", "Auto Detect");
    formData.append("language", "Auto Detect");

    const response = await fetch(
      `${API_URL}/api/detect-reference-type`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    console.log(data);

    setReferenceType(data.referenceType);
    setReferenceLanguage("English");
  };

  const resetEvaluation = () => {
    setReferenceFile(null);
    setMainFile(null);
    setEvaluated(false);
    setResult(null);
  };

  return (
    <>
      {loading && <LoadingScreen />}

      {!loading && !evaluated && (
        <UploadScreen
          referenceFile={referenceFile}
          setReferenceFile={setReferenceFile}
          mainFile={mainFile}
          setMainFile={setMainFile}
          evaluateDocument={evaluateDocument}
          detectReference={detectReference}
        />
      )}

      {!loading && evaluated && (
        <ComparisonReport
          result={result}
          onNewEvaluation={resetEvaluation}
        />
      )}
    </>
  );
}

export default Comparison;