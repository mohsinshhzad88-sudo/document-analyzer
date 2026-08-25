import React, { useState } from "react";
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

    <div className="tax-upload-page">

      <div className="tax-upload-container">

        {/* HEADER */}

        <div className="tax-upload-header">

          <div>

            <span className="tax-upload-eyebrow">
              🧾 TAX ASSISTANT
            </span>

            <h1>
              Tax Document Analyzer
            </h1>

            <p>
              Upload up to 10 tax-related documents
              and analyze the available financial evidence.
            </p>

          </div>

          <div className="tax-upload-count">

            <strong>
              {files.length}
            </strong>

            <span>
              / 10 documents
            </span>

          </div>

        </div>


        {/* UPLOAD */}

        <div className="tax-upload-card">

          <div>

            <h2>
              Upload tax documents
            </h2>

            <p>
              Salary records, bank statements,
              withholding records, tax returns,
              business records, or property records.
            </p>

          </div>


          <label className="tax-upload-button">

            📁 Browse Files

            <input
              type="file"
              multiple
              accept=".pdf"
              onChange={handleFileChange}
              hidden
            />

          </label>

        </div>


        {/* DOCUMENT LIST */}

        {files.length > 0 && (

          <section className="tax-files-section">

            <div className="tax-files-heading">

              <div>

                <span>
                  DOCUMENTS
                </span>

                <h2>
                  Uploaded Files
                </h2>

              </div>

              <div className="tax-count-pill">
                {files.length}
              </div>

            </div>


            <div className="tax-file-list">

              {files.map((file, index) => (

                <div
                  className="tax-file-item"
                  key={`${file.name}-${index}`}
                >

                  <div className="tax-file-icon">
                    📄
                  </div>


                  <div className="tax-file-content">

                    <strong>
                      {file.name}
                    </strong>


                    {file.documentType ? (

                      <div className="tax-file-meta">

                        <span className="tax-type-pill">
                          {file.documentType}
                        </span>

                        <span>
                          {file.confidence}%
                          confidence
                        </span>

                      </div>

                    ) : (

                      <span className="tax-waiting">
                        Waiting for processing...
                      </span>

                    )}


                    {file.extractedData && (

                      <details className="tax-extracted">

                        <summary>
                          View extracted information
                        </summary>

                        <div className="tax-extracted-grid">

                          {Object.entries(
                            file.extractedData
                          ).map(
                            ([key, value]) => (

                              <div
                                key={key}
                                className="tax-extracted-item"
                              >

                                <span>
                                  {formatLabel(key)}
                                </span>

                                <strong>
                                  {formatValue(value)}
                                </strong>

                              </div>

                            )
                          )}

                        </div>

                      </details>

                    )}

                  </div>


                  <button
                    type="button"
                    className="tax-remove-button"
                    onClick={() =>
                      removeFile(index)
                    }
                    disabled={
                      processing ||
                      analyzing
                    }
                  >
                    ×
                  </button>

                </div>

              ))}

            </div>

          </section>

        )}


        {/* STEP 1 BUTTON */}

        {files.length > 0 && !processed && (

          <button
            type="button"
            className="tax-action-button"
            onClick={processDocuments}
            disabled={
              processing ||
              analyzing
            }
          >

            {processing
              ? "🧠 Processing Documents..."
              : "🔎 Process Tax Documents"}

          </button>

        )}


        {/* STEP 2 BUTTON */}

        {processed && !analysis && (

          <button
            type="button"
            className="tax-action-button"
            onClick={analyzeDocuments}
            disabled={
              processing ||
              analyzing
            }
          >

            {analyzing
              ? "🧠 Analyzing Tax Documents..."
              : "🧠 Analyze Tax Documents"}

          </button>

        )}


        {/* PROFESSIONAL REPORT */}

        {analysis && (

          <TaxAssessmentReport
            assessment={assessment}
            analysis={analysis}
            files={files}
          />

        )}

      </div>

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


export default TaxUpload;