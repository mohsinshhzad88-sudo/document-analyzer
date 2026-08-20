import React, { useState } from "react";
import DecisionComparisonReport from "../components/decisionComparison/DecisionComparisonReport";
import UploadScreen from "../components/decisionComparison/UploadScreen";
import LoadingScreen from "../components/decisionComparison/LoadingScreen";


function DecisionComparison() {
  const [documentA, setDocumentA] = useState(null);
  const [documentB, setDocumentB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluated, setEvaluated] = useState(false);
  const [report, setReport] = useState(null);

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://document-analyzer-two.vercel.app";

  const compareDocuments = async () => {
    if (!documentA || !documentB) return;

    setLoading(true);

    const formData = new FormData();

    formData.append("documentA", documentA);
    formData.append("documentB", documentB);

    try {
      const response = await fetch(
        `${API_URL}/api/decision-compare`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      console.log("DECISION COMPARISON RESULT:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Decision comparison failed."
        );
      }

      setReport(data.result);
      setEvaluated(true);
    } catch (error) {
      console.error("Decision comparison error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetComparison = () => {
    setDocumentA(null);
    setDocumentB(null);
    setReport(null);
    setEvaluated(false);
  };

  return (
    <>
      {loading && <LoadingScreen />}

      {!loading && !evaluated && (
        <UploadScreen
          documentA={documentA}
          setDocumentA={setDocumentA}
          documentB={documentB}
          setDocumentB={setDocumentB}
          compareDocuments={compareDocuments}
        />
      )}

      
      {!loading && evaluated && (
  <DecisionComparisonReport
    report={report}
    currentDocumentLanguage="English"
    currentOutputLanguage="English"
    onNewComparison={resetComparison}
  />
)}
    </>
  );
}

export default DecisionComparison;