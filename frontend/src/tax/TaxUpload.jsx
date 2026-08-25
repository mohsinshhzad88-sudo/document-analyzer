import React, { useState } from "react";

function TaxUpload() {

  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [processed, setProcessed] = useState(false);
  const [processedDocuments, setProcessedDocuments] = useState([]);

  const handleFiles = (selectedFiles) => {

    const newFiles = Array.from(selectedFiles);

     setProcessedDocuments([]);

    setFiles((currentFiles) => {

      const combined = [
        ...currentFiles,
        ...newFiles
      ];

      return combined.slice(0, 10);

    });

    // Clear previous analysis when new documents are added
    setAnalysis(null);
    setProcessed(false);

  };

  const handleFileChange = (event) => {

    handleFiles(event.target.files);

    // Allow selecting the same file again
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
    setProcessed(false)

  };


  /*
   * STEP 1
   *
   * Process uploaded documents.
   *
   * This performs:
   * - Classification
   * - Information extraction
   */

  const processDocuments = async () => {

    if (files.length === 0) {
      return;
    }

    setProcessing(true);
    setAnalysis(null);

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

       // STEP 1 completed successfully
       setProcessedDocuments(result.documents);
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
   * STEP 2
   *
   * Perform cross-document tax analysis.
   */

  const analyzeDocuments = async () => {

    if (files.length === 0) {
      return;
    }

    setAnalyzing(true);

   

    try {

      console.log(
        "🧠 Sending documents for tax analysis:",
        files.length
      );

      const response = await fetch(
  "http://localhost:5000/api/tax/analyze",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      documents:processedDocuments
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

      setAnalysis(result.analysis);

      /*
       * Also update the displayed documents
       * with the latest processed information.
       */

      if (result.documents) {

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

      }

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

      <div className="tax-upload-box">

        <h2>
          🧾 Tax Document Analyzer
        </h2>

        <p>
          Upload up to 10 tax-related documents at once.
        </p>


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


        <p className="tax-file-limit">
          {files.length} / 10 documents
        </p>


        {files.length > 0 && (

          <div className="tax-file-list">

            {files.map((file, index) => (

              <div
                className="tax-file-item"
                key={`${file.name}-${index}`}
              >

                <div className="tax-file-info">

                  <strong>
                    {file.name}
                  </strong>


                  {file.documentType ? (

                    <div className="tax-detected-type">

                      📄 {file.documentType}

                      {" "}

                      ({file.confidence}% confidence)

                    </div>

                  ) : (

                    <div className="tax-detected-type">

                      🧠 Waiting for analysis...

                    </div>

                  )}


                  {file.extractedData && (

                    <div className="tax-extracted-data">

                      <h4>
                        Extracted Information
                      </h4>


                      {Object.entries(
                        file.extractedData
                      ).map(
                        ([key, value]) => (

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

                        )
                      )}

                    </div>

                  )}

                </div>


                <button
                  type="button"
                  onClick={() =>
                    removeFile(index)
                  }
                  disabled={processing || analyzing}
                >
                  ✕
                </button>

              </div>

            ))}

          </div>

        )}


        {files.length > 0 && !processed && (

          <button
            type="button"
            className="tax-process-button"
            onClick={processDocuments}
            disabled={processing || analyzing}
          >

            {processing
              ? "🧠 Processing Documents..."
              : "🔎 Process Tax Documents"}

          </button>

        )}


        {files.length > 0 && processed && (

          <button
            type="button"
            className="tax-process-button"
            onClick={analyzeDocuments}
            disabled={processing || analyzing}
          >

            {analyzing
              ? "🧠 Analyzing Tax Documents..."
              : "🧠 Analyze Tax Documents"}

          </button>

        )}


        {analysis && (

          <div className="tax-analysis">

            <h3>
              🧠 Tax Analysis
            </h3>


            <div className="tax-analysis-section">

              <h4>
                Summary
              </h4>

              <p>
                {analysis.summary}
              </p>

            </div>


            <div className="tax-analysis-section">

              <h4>
                📊 Financial Overview
              </h4>

              {renderList(
                analysis.financialOverview
              )}

            </div>


            <div className="tax-analysis-section">

              <h4>
                🧾 Tax Overview
              </h4>

              {renderList(
                analysis.taxOverview
              )}

            </div>


            <div className="tax-analysis-section">

              <h4>
                💰 Income Sources
              </h4>

              {renderList(
                analysis.incomeSources
              )}

            </div>


            <div className="tax-analysis-section">

              <h4>
                🔍 Consistency Checks
              </h4>

              {renderList(
                analysis.consistencyChecks
              )}

            </div>


            <div className="tax-analysis-section">

              <h4>
                ⚠️ Missing Information
              </h4>

              {renderList(
                analysis.missingInformation
              )}

            </div>


            <div className="tax-analysis-section">

              <h4>
                🚨 Potential Issues
              </h4>

              {renderList(
                analysis.potentialIssues
              )}

            </div>


            <div className="tax-analysis-section">

              <h4>
                📄 Document Summary
              </h4>

              {renderList(
                analysis.documentSummary
              )}

            </div>


            <div className="tax-analysis-section">

              <h4>
                📋 Overall Assessment
              </h4>

              <p>
                {analysis.overallAssessment}
              </p>

            </div>


            <div className="tax-analysis-confidence">

              <strong>
                Analysis Confidence:
              </strong>

              {" "}

              {analysis.confidence}%

            </div>

          </div>

        )}

      </div>

    </div>

  );

}


/*
 * Convert camelCase into readable text.
 */

function formatLabel(key) {

  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) =>
      char.toUpperCase()
    );

}


/*
 * Display null values safely.
 */

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

    return value.join(", ");

  }


  if (typeof value === "object") {

    return JSON.stringify(value);

  }


  return String(value);

}


/*
 * Render analysis arrays safely.
 */

function renderList(items) {

  if (!Array.isArray(items) || items.length === 0) {

    return (
      <p>
        None reported.
      </p>
    );

  }

  return (

    <ul>

      {items.map(
        (item, index) => (

          <li key={index}>
            {item}
          </li>

        )
      )}

    </ul>

  );

}


export default TaxUpload;

