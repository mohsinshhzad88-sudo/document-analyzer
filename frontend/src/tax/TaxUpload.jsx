import React, { useState } from "react";
import "./TaxUpload.css";
import TaxAssessmentReport from "./TaxAssessmentReport";

function TaxUpload() {

  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [processed, setProcessed] = useState(false);
  const [processedDocuments, setProcessedDocuments] = useState([]);

  const handleFiles = (selectedFiles) => {

    const newFiles = Array.from(selectedFiles);

    setProcessedDocuments([]);
    setAnalysis(null);
    setAssessment(null);
    setProcessed(false);

    setFiles((currentFiles) => {

      const combined = [
        ...currentFiles,
        ...newFiles
      ];

      return combined.slice(0, 10);

    });

  };


  const handleFileChange = (event) => {

    handleFiles(event.target.files);

    event.target.value = "";

  };


  const removeFile = (indexToRemove) => {

    setFiles((currentFiles) =>
      currentFiles.filter(
        (_, index) => index !== indexToRemove
      )
    );

    setProcessedDocuments([]);
    setAnalysis(null);
    setAssessment(null);
    setProcessed(false);

  };


  /*
   * ============================================
   * STEP 1
   * PROCESS TAX DOCUMENTS
   * ============================================
   */

  const processDocuments = async () => {

    if (files.length === 0) {
      return;
    }

    setProcessing(true);
    setAnalysis(null);
    setAssessment(null);

    const formData = new FormData();

    files.forEach((file) => {
      formData.append("documents", file);
    });

    try {

      console.log(
        "🧾 Sending tax documents:",
        files.length
      );

      const response = await fetch(
        "http://localhost:5000/api/tax/process",
        {
          method: "POST",
          body: formData
        }
      );

      const result = await response.json();

      console.log(
        "🧾 Tax processing response:",
        result
      );

      if (!result.success) {

        throw new Error(
          result.message ||
          "Tax processing failed"
        );

      }

      setFiles((currentFiles) =>
        currentFiles.map((file) => {

          const processedDocument =
            result.documents.find(
              (document) =>
                document.fileName === file.name
            );

          if (!processedDocument) {
            return file;
          }

          return {
            ...file,

            documentType:
              processedDocument.documentType,

            confidence:
              processedDocument.confidence,

            extractedData:
              processedDocument.data
          };

        })
      );

      setProcessedDocuments(
        result.documents || []
      );

      /*
       * /api/tax/process already returns
       * the deterministic assessment.
       */

      if (result.assessment) {
        setAssessment(result.assessment);
      }

      setProcessed(true);

    } catch (error) {

      console.error(
        "❌ Tax processing failed:",
        error
      );

      alert(
        "Tax processing failed: " +
        error.message
      );

    } finally {

      setProcessing(false);

    }

  };


  /*
   * ============================================
   * STEP 2
   * ANALYZE TAX DOCUMENTS
   * ============================================
   */

  const analyzeDocuments = async () => {

    if (processedDocuments.length === 0) {
      return;
    }

    setAnalyzing(true);

    try {

      console.log(
        "🧠 Sending documents for tax analysis:",
        processedDocuments.length
      );

      const response = await fetch(
        "http://localhost:5000/api/tax/analyze",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            documents: processedDocuments
          })
        }
      );

      const result = await response.json();

      console.log(
        "🧠 Tax analysis response:",
        result
      );

      if (!result.success) {

        throw new Error(
          result.message ||
          "Tax analysis failed"
        );

      }

      /*
       * Keep both objects:
       *
       * assessment = deterministic facts/checks
       * analysis   = AI explanation
       */

      setAssessment(
        result.assessment || null
      );

      setAnalysis(
        result.analysis || null
      );

    } catch (error) {

      console.error(
        "❌ Tax analysis failed:",
        error
      );

      alert(
        "Tax analysis failed: " +
        error.message
      );

    } finally {

      setAnalyzing(false);

    }

  };

return (
  <div className="tax-upload-container">

    <div className="tax-page-header">

      <div className="tax-eyebrow">
        🧾 TAX ASSISTANT
      </div>

      <h1>
        Tax Document Analyzer
      </h1>

      <p>
        Upload financial and tax documents to build a structured
        evidence-based tax assessment.
      </p>

    </div>


    <div className="tax-upload-card">

      <div className="tax-upload-card-header">

        <div>

          <div className="tax-section-label">
            UPLOAD TAX DOCUMENTS
          </div>

          <h2>
            Add your financial evidence
          </h2>

          <p>
            Salary records, bank statements, withholding records,
            tax returns, business records, or property records.
          </p>

        </div>

        <div className="tax-limit-badge">
          {files.length} / 10
        </div>

      </div>


      <label className="tax-drop-zone">

        <div className="tax-upload-icon">
          📄
        </div>

        <div className="tax-drop-title">
          Upload tax documents
        </div>

        <div className="tax-drop-description">
          PDF files • Up to 10 documents
        </div>

        <span className="tax-browse-button">
          📁 Browse Files
        </span>

        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileChange}
          hidden
        />

      </label>

    </div>


    {files.length > 0 && (

      <div className="tax-documents-section">

        <div className="tax-documents-header">

          <div>

            <div className="tax-section-label">
              DOCUMENTS
            </div>

            <h2>
              Uploaded Files
            </h2>

          </div>

          <div className="tax-document-count">
            {files.length} / 10 documents
          </div>

        </div>


        <div className="tax-file-list">

          {files.map((file, index) => (

            <div
              className="tax-file-card"
              key={`${file.name}-${index}`}
            >

              <div className="tax-file-icon">
                📄
              </div>


              <div className="tax-file-content">

                <div className="tax-file-name">
                  {file.name}
                </div>


                {file.documentType ? (

                  <div className="tax-file-status-row">

                    <span className="tax-file-type">
                      {file.documentType}
                    </span>

                    <span className="tax-file-confidence">
                      {file.confidence}% confidence
                    </span>

                    <span className="tax-file-processed">
                      ✓ Processed
                    </span>

                  </div>

                ) : (

                  <div className="tax-file-waiting">
                    Waiting for processing...
                  </div>

                )}


                {file.extractedData && (

                  <div className="tax-extracted-data">

                    <div className="tax-extracted-header">
                      Extracted Information
                    </div>

                    <div className="tax-extracted-grid">

                      {Object.entries(
                        file.extractedData
                      ).map(([key, value]) => (

                        <div
                          className="tax-data-row"
                          key={key}
                        >

                          <span>
                            {formatLabel(key)}
                          </span>

                          <strong>
                            {formatValue(value)}
                          </strong>

                        </div>

                      ))}

                    </div>

                  </div>

                )}

              </div>


              <button
                type="button"
                className="tax-remove-button"
                onClick={() => removeFile(index)}
                disabled={processing || analyzing}
                aria-label={`Remove ${file.name}`}
              >
                ×
              </button>

            </div>

          ))}

        </div>


        {!processed && (

          <button
            type="button"
            className="tax-primary-button"
            onClick={processDocuments}
            disabled={processing || analyzing}
          >

            {processing
              ? "🧠 Processing Documents..."
              : "🔎 Process Tax Documents"}

          </button>

        )}


        {processed && (

          <button
            type="button"
            className="tax-primary-button"
            onClick={analyzeDocuments}
            disabled={processing || analyzing}
          >

            {analyzing
              ? "🧠 Analyzing Tax Documents..."
              : "🧠 Analyze Tax Documents"}

          </button>

        )}

      </div>

    )}


    {analysis && assessment && (

  <TaxAssessmentReport
    analysis={analysis}
    assessment={assessment}
    files={files}
  />

)}

  </div>
);

}


/*
 * ============================================
 * FORMAT HELPERS
 * ============================================
 */

function formatLabel(key) {

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) =>
      char.toUpperCase()
    );

}



function formatValue(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not found";
  }

  if (Array.isArray(value)) {

    if (value.length === 0) {
      return "None";
    }

    return value
      .map((item) =>
        typeof item === "object"
          ? JSON.stringify(item)
          : String(item)
      )
      .join(", ");

  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);

}

function renderList(items) {

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return (
      <p>
        None reported.
      </p>
    );
  }

  return (
    <ul>

      {items.map((item, index) => (

        <li key={index}>
          {typeof item === "string"
            ? item
            : item?.analysis ||
              item?.description ||
              item?.name ||
              JSON.stringify(item)}
        </li>

      ))}

    </ul>
  );
}

export default TaxUpload;