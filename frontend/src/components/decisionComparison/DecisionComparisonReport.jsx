
import React from "react";
import "./DecisionComparisonReport.css";

function DecisionComparisonReport({
  report,
  currentDocumentLanguage,
  currentOutputLanguage,
}) {
  if (!report) return null;

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://document-analyzer-two.vercel.app";

  const language =
    currentOutputLanguage &&
    currentOutputLanguage !== "Same as Input"
      ? currentOutputLanguage
      : currentDocumentLanguage || "English";

  const languageCode = String(language)
    .toLowerCase()
    .trim()
    .split("-")[0]
    .split("_")[0];

  const rtlLanguages = [
    "ar",
    "ur",
    "fa",
    "he",
    "ps",
    "sd",
  ];

  const isRTL = rtlLanguages.includes(languageCode);

  const textDirection = isRTL ? "rtl" : "ltr";
  const textAlign = isRTL ? "right" : "left";

  const textFont =
    languageCode === "ur"
      ? '"Jameel Noori Nastaleeq", "Noto Sans Arabic", "Noto Sans", sans-serif'
      : isRTL
      ? '"Noto Sans Arabic", "Noto Sans", "Segoe UI", Arial, sans-serif'
      : '"Noto Sans", "Noto Sans Devanagari", "Segoe UI", Arial, sans-serif';

  const safe = (value) => {
    if (value === null || value === undefined) return "";

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  const confidence = Math.min(
    Math.max(Number(report.resolution?.confidence) || 0, 0),
    100
  );

  const confidenceColor =
    confidence >= 85
      ? "#15803d"
      : confidence >= 70
      ? "#b45309"
      : "#b91c1c";

  const getEvidenceStatusClass = (status) => {
    switch (status) {
      case "Supported":
        return "status-supported";

      case "Partially Supported":
        return "status-partial";

      case "Contradicted":
        return "status-contradicted";

      case "Unsupported":
        return "status-unsupported";

      default:
        return "status-insufficient";
    }
  };

  const downloadComparisonPDF = async () => {
    const pdfElement = document.createElement("div");

    pdfElement.style.position = "absolute";
    pdfElement.style.left = "-10000px";
    pdfElement.style.top = "0";
    pdfElement.style.width = "794px";
    pdfElement.style.background = "#ffffff";
    pdfElement.style.color = "#1f2937";
    pdfElement.style.boxSizing = "border-box";
    pdfElement.style.direction = "ltr";
    pdfElement.style.textAlign = "left";
    pdfElement.style.fontFamily = textFont;

    const sectionTitle = (
      number,
      title,
      subtitle = ""
    ) => `
      <div style="
        margin-top:30px;
        margin-bottom:14px;
        page-break-after:avoid;
        direction:ltr;
        text-align:left;
      ">

        <div style="
          display:flex;
          align-items:baseline;
          gap:10px;
          direction:ltr;
        ">

          <span style="
            font-size:11px;
            font-weight:700;
            color:#6366f1;
            letter-spacing:1px;
          ">
            ${number}
          </span>

          <span style="
            font-size:18px;
            font-weight:700;
            color:#111827;
            font-family:'Noto Sans', 'Segoe UI', Arial, sans-serif;
          ">
            ${title}
          </span>

        </div>

        ${
          subtitle
            ? `
              <div style="
                margin-top:4px;
                margin-left:30px;
                font-size:11px;
                color:#6b7280;
                font-family:'Noto Sans', 'Segoe UI', Arial, sans-serif;
              ">
                ${subtitle}
              </div>
            `
            : ""
        }

        <div style="
          height:1px;
          background:#d1d5db;
          margin-top:10px;
        "></div>

      </div>
    `;

    const renderClaims = (claims) => {
      if (!Array.isArray(claims) || claims.length === 0) {
        return `
          <div style="
            padding:14px 4px;
            font-size:12px;
            color:#6b7280;
          ">
            No major claims identified.
          </div>
        `;
      }

      return claims
        .map(
          (claim, index) => `
            <div style="
              border:1px solid #e5e7eb;
              padding:16px;
              margin-bottom:12px;
              page-break-inside:avoid;
              direction:ltr;
            ">

              <div style="
                font-size:10px;
                color:#9ca3af;
                font-weight:700;
                margin-bottom:6px;
              ">
                CLAIM ${String(index + 1).padStart(2, "0")}
              </div>

              <div style="
                font-size:14px;
                line-height:1.7;
                font-weight:600;
                color:#111827;
                direction:${textDirection};
                text-align:${textAlign};
                font-family:${textFont};
              ">
                ${safe(claim.claim)}
              </div>

              <div style="
                margin-top:10px;
                display:flex;
                gap:8px;
                flex-wrap:wrap;
                direction:ltr;
              ">

                <span style="
                  padding:5px 9px;
                  border-radius:6px;
                  background:#f3f4f6;
                  font-size:10px;
                  font-weight:600;
                ">
                  ${safe(claim.evidenceStatus || "Insufficient Evidence")}
                </span>

                <span style="
                  padding:5px 9px;
                  border-radius:6px;
                  background:#eef2ff;
                  color:#4338ca;
                  font-size:10px;
                  font-weight:600;
                ">
                  ${safe(claim.evidenceQuality || "Insufficient")}
                </span>

              </div>

              ${
                Array.isArray(claim.evidence) &&
                claim.evidence.length > 0
                  ? `
                    <div style="
                      margin-top:12px;
                      font-size:11px;
                      color:#6b7280;
                    ">
                      <strong>Evidence:</strong>
                      ${claim.evidence.map(safe).join(" • ")}
                    </div>
                  `
                  : ""
              }

              ${
                claim.analysis
                  ? `
                    <div style="
                      margin-top:10px;
                      font-size:12px;
                      line-height:1.7;
                      color:#374151;
                      direction:${textDirection};
                      text-align:${textAlign};
                      font-family:${textFont};
                    ">
                      ${safe(claim.analysis)}
                    </div>
                  `
                  : ""
              }

            </div>
          `
        )
        .join("");
    };

    const renderSimpleList = (items, emptyText) => {
      if (!Array.isArray(items) || items.length === 0) {
        return `
          <div style="
            padding:14px 4px;
            font-size:12px;
            color:#6b7280;
          ">
            ${safe(emptyText)}
          </div>
        `;
      }

      return items
        .map(
          (item, index) => `
            <div style="
              border-bottom:1px solid #e5e7eb;
              padding:12px 4px;
              page-break-inside:avoid;
              direction:ltr;
            ">

              <div style="
                display:flex;
                gap:12px;
              ">

                <div style="
                  width:28px;
                  flex-shrink:0;
                  font-size:10px;
                  color:#9ca3af;
                  font-weight:700;
                ">
                  ${String(index + 1).padStart(2, "0")}
                </div>

                <div style="
                  flex:1;
                  font-size:12px;
                  line-height:1.7;
                  color:#374151;
                  direction:${textDirection};
                  text-align:${textAlign};
                  font-family:${textFont};
                ">
                  ${
                    typeof item === "string"
                      ? safe(item)
                      : safe(item.analysis || item.topic || item.gap || "")
                  }
                </div>

              </div>

            </div>
          `
        )
        .join("");
    };

    const renderAgreements = () => {
      if (
        !Array.isArray(report.agreements) ||
        report.agreements.length === 0
      ) {
        return `<div style="color:#6b7280;font-size:12px;">No major agreements identified.</div>`;
      }

      return report.agreements
        .map(
          (item, index) => `
            <div style="
              border:1px solid #d1d5db;
              background:#fafafa;
              padding:14px;
              margin-bottom:10px;
              page-break-inside:avoid;
            ">

              <div style="
                font-size:13px;
                font-weight:700;
                color:#111827;
              ">
                ${String(index + 1).padStart(2, "0")} —
                ${safe(item.topic)}
              </div>

              <div style="
                margin-top:6px;
                font-size:12px;
                line-height:1.7;
                color:#374151;
                direction:${textDirection};
                text-align:${textAlign};
                font-family:${textFont};
              ">
                ${safe(item.analysis)}
              </div>

            </div>
          `
        )
        .join("");
    };

    const renderDisagreements = () => {
      if (
        !Array.isArray(report.disagreements) ||
        report.disagreements.length === 0
      ) {
        return `<div style="color:#6b7280;font-size:12px;">No genuine disagreements identified.</div>`;
      }

      return report.disagreements
        .map(
          (item, index) => `
            <div style="
              border:1px solid #e5e7eb;
              padding:16px;
              margin-bottom:12px;
              page-break-inside:avoid;
            ">

              <div style="
                font-size:14px;
                font-weight:700;
                color:#111827;
              ">
                ${String(index + 1).padStart(2, "0")} —
                ${safe(item.topic)}
              </div>

              <div style="
                margin-top:12px;
                display:flex;
                gap:14px;
              ">

                <div style="
                  flex:1;
                  background:#f9fafb;
                  padding:12px;
                  border-left:3px solid #6366f1;
                ">
                  <div style="
                    font-size:9px;
                    font-weight:700;
                    color:#6366f1;
                    text-transform:uppercase;
                  ">
                    Document A
                  </div>

                  <div style="
                    margin-top:5px;
                    font-size:11px;
                    line-height:1.6;
                    direction:${textDirection};
                    text-align:${textAlign};
                    font-family:${textFont};
                  ">
                    ${safe(item.documentA)}
                  </div>
                </div>

                <div style="
                  flex:1;
                  background:#f9fafb;
                  padding:12px;
                  border-left:3px solid #111827;
                ">
                  <div style="
                    font-size:9px;
                    font-weight:700;
                    color:#111827;
                    text-transform:uppercase;
                  ">
                    Document B
                  </div>

                  <div style="
                    margin-top:5px;
                    font-size:11px;
                    line-height:1.6;
                    direction:${textDirection};
                    text-align:${textAlign};
                    font-family:${textFont};
                  ">
                    ${safe(item.documentB)}
                  </div>
                </div>

              </div>

              <div style="
                margin-top:12px;
                font-size:12px;
                line-height:1.7;
                color:#374151;
                direction:${textDirection};
                text-align:${textAlign};
                font-family:${textFont};
              ">
                ${safe(item.analysis)}
              </div>

            </div>
          `
        )
        .join("");
    };

    const renderMethodology = () => {
      if (
        !Array.isArray(report.methodologicalDifferences) ||
        report.methodologicalDifferences.length === 0
      ) {
        return `<div style="color:#6b7280;font-size:12px;">No major methodological differences identified.</div>`;
      }

      return report.methodologicalDifferences
        .map(
          (item, index) => `
            <div style="
              border-bottom:1px solid #e5e7eb;
              padding:13px 4px;
              page-break-inside:avoid;
            ">

              <div style="
                font-size:13px;
                font-weight:700;
                color:#111827;
              ">
                ${String(index + 1).padStart(2, "0")} —
                ${safe(item.factor)}
              </div>

              <div style="
                margin-top:9px;
                font-size:11px;
                line-height:1.6;
              ">
                <strong>Document A:</strong>
                ${safe(item.documentA)}
              </div>

              <div style="
                margin-top:5px;
                font-size:11px;
                line-height:1.6;
              ">
                <strong>Document B:</strong>
                ${safe(item.documentB)}
              </div>

              <div style="
                margin-top:7px;
                font-size:11px;
                line-height:1.6;
                color:#4b5563;
              ">
                <strong>Impact:</strong>
                ${safe(item.impact)}
              </div>

            </div>
          `
        )
        .join("");
    };

    pdfElement.innerHTML = `
      <div style="
        width:794px;
        min-height:1123px;
        padding:54px 58px 42px;
        box-sizing:border-box;
        background:#ffffff;
        direction:ltr;
        text-align:left;
        color:#1f2937;
      ">

        <div style="
          border-bottom:2px solid #111827;
          padding-bottom:22px;
        ">

          <div style="
            font-size:11px;
            font-weight:700;
            color:#6366f1;
            letter-spacing:2px;
            text-transform:uppercase;
            margin-bottom:8px;
          ">
            DOCUMENT ANALYZER
          </div>

          <div style="
            font-size:30px;
            font-weight:700;
            color:#111827;
            line-height:1.2;
          ">
            AI Decision Comparison Report
          </div>

          <div style="
            margin-top:7px;
            font-size:12px;
            color:#6b7280;
          ">
            Evidence resolution between competing positions
          </div>

        </div>


        <div style="
          display:flex;
          justify-content:space-between;
          padding:14px 0;
          border-bottom:1px solid #e5e7eb;
        ">

          <div>
            <div style="
              font-size:9px;
              color:#9ca3af;
              text-transform:uppercase;
              letter-spacing:1px;
            ">
              Analysis Mode
            </div>

            <div style="
              margin-top:3px;
              font-size:12px;
              font-weight:600;
            ">
              Decision Comparison
            </div>
          </div>

          <div style="text-align:right;">
            <div style="
              font-size:9px;
              color:#9ca3af;
              text-transform:uppercase;
              letter-spacing:1px;
            ">
              Language
            </div>

            <div style="
              margin-top:3px;
              font-size:12px;
              font-weight:600;
            ">
              ${safe(language)}
            </div>
          </div>

        </div>


        ${sectionTitle(
          "01",
          "The Two Positions",
          "The central positions presented by each document"
        )}

        <div style="
          display:flex;
          gap:14px;
        ">

          <div style="
            flex:1;
            border:1px solid #c7d2fe;
            background:#eef2ff;
            padding:18px;
            page-break-inside:avoid;
          ">
            <div style="
              font-size:10px;
              font-weight:700;
              color:#6366f1;
              text-transform:uppercase;
            ">
              Document A
            </div>

            <div style="
              margin-top:9px;
              font-size:13px;
              line-height:1.7;
              direction:${textDirection};
              text-align:${textAlign};
              font-family:${textFont};
            ">
              ${safe(report.documentA?.position || "No position identified.")}
            </div>
          </div>


          <div style="
            flex:1;
            border:1px solid #d1d5db;
            background:#fafafa;
            padding:18px;
            page-break-inside:avoid;
          ">
            <div style="
              font-size:10px;
              font-weight:700;
              color:#111827;
              text-transform:uppercase;
            ">
              Document B
            </div>

            <div style="
              margin-top:9px;
              font-size:13px;
              line-height:1.7;
              direction:${textDirection};
              text-align:${textAlign};
              font-family:${textFont};
            ">
              ${safe(report.documentB?.position || "No position identified.")}
            </div>
          </div>

        </div>


        ${sectionTitle(
          "02",
          "Document A — Claims",
          "Claims and evidence supporting the first position"
        )}

        ${renderClaims(report.documentA?.mainClaims)}


        ${sectionTitle(
          "03",
          "Document B — Claims",
          "Claims and evidence supporting the second position"
        )}

        ${renderClaims(report.documentB?.mainClaims)}


        ${sectionTitle(
          "04",
          "Agreements",
          "Where the two documents establish compatible findings"
        )}

        ${renderAgreements()}


        ${sectionTitle(
          "05",
          "Disagreements",
          "Genuine conflicts between the positions"
        )}

        ${renderDisagreements()}


        ${sectionTitle(
          "06",
          "Methodological Differences",
          "Differences that may explain apparently conflicting conclusions"
        )}

        ${renderMethodology()}


        ${sectionTitle(
          "07",
          "Evidence Gaps",
          "Missing evidence that limits the ability to resolve the disagreement"
        )}

        ${renderSimpleList(
          report.evidenceGaps,
          "No major evidence gaps identified."
        )}


        ${sectionTitle(
          "08",
          "Final Resolution",
          "What the available evidence currently establishes"
        )}

        <div style="
          border:1px solid #c7d2fe;
          background:#eef2ff;
          padding:22px;
          page-break-inside:avoid;
          direction:${textDirection};
          text-align:${textAlign};
          font-family:${textFont};
        ">

          <div style="
            font-size:10px;
            color:#6366f1;
            text-transform:uppercase;
            letter-spacing:1px;
            font-weight:700;
            direction:ltr;
            text-align:left;
          ">
            Evidence Resolution
          </div>

          <div style="
            margin-top:8px;
            font-size:22px;
            font-weight:700;
            color:#111827;
          ">
            ${safe(
              report.resolution?.outcome ||
                "The disagreement cannot currently be resolved"
            )}
          </div>

          <div style="
            margin-top:12px;
            font-size:13px;
            line-height:1.75;
            color:#374151;
          ">
            ${safe(
              report.resolution?.explanation ||
                "Insufficient information was available to determine the resolution."
            )}
          </div>

        </div>


        ${sectionTitle(
          "09",
          "What Would Change the Result",
          "Additional evidence that could alter the current resolution"
        )}

        ${renderSimpleList(
          report.whatWouldChangeTheResult,
          "No additional evidence was identified."
        )}


        ${sectionTitle(
          "10",
          "Confidence",
          "Confidence in the evidence-based resolution"
        )}

        <div style="
          border:1px solid #d1d5db;
          background:#fafafa;
          padding:24px;
          text-align:center;
          page-break-inside:avoid;
        ">

          <div style="
            font-size:10px;
            color:#6b7280;
            text-transform:uppercase;
            letter-spacing:1px;
          ">
            Resolution Confidence
          </div>

          <div style="
            margin-top:8px;
            font-size:46px;
            line-height:1;
            font-weight:700;
            color:${confidenceColor};
          ">
            ${confidence}%
          </div>

          <div style="
            margin-top:15px;
            height:10px;
            background:#e5e7eb;
            overflow:hidden;
          ">
            <div style="
              width:${confidence}%;
              height:100%;
              background:${confidenceColor};
            "></div>
          </div>

        </div>


        <div style="
          margin-top:35px;
          padding:18px;
          border:1px solid #e5e7eb;
          background:#fafafa;
          font-size:12px;
          line-height:1.7;
          color:#374151;
          direction:${textDirection};
          text-align:${textAlign};
          font-family:${textFont};
        ">
          <strong>Summary:</strong>
          ${safe(
            report.summary ||
              "No summary was provided."
          )}
        </div>


        <div style="
          margin-top:42px;
          padding-top:12px;
          border-top:1px solid #d1d5db;
          display:flex;
          justify-content:space-between;
          font-size:9px;
          color:#9ca3af;
        ">

          <div>
            Document Analyzer • AI Decision Comparison Report
          </div>

          <div>
            Evidence-Based Evaluation
          </div>

        </div>

      </div>
    `;

    document.body.appendChild(pdfElement);

    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }

      if (languageCode === "ur") {
        try {
          const jameelFont = new FontFace(
            "Jameel Noori Nastaleeq",
            'url("/fonts/Jameel%20Noori%20Nastaleeq%20Regular.ttf")'
          );

          await jameelFont.load();
          document.fonts.add(jameelFont);
        } catch (fontError) {
          console.warn(
            "Jameel font could not be loaded:",
            fontError
          );
        }
      }

      await new Promise((resolve) =>
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        })
      );

      console.log("🔥 DECISION COMPARISON PDF HTML READY 🔥");

      const response = await fetch(
        `${API_URL}/api/generate-pdf`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            html: pdfElement.innerHTML,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `PDF server error: ${response.status} ${errorText}`
        );
      }

      const pdfBlob = await response.blob();

      console.log(
        "🔥 DECISION COMPARISON PDF RECEIVED:",
        pdfBlob.size,
        "bytes"
      );

      const url = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");

      link.href = url;
      link.download =
        "AI-Decision-Comparison-Report.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);

      console.log(
        "🔥 DECISION COMPARISON PDF DOWNLOAD COMPLETE 🔥"
      );

    } catch (error) {
      console.error(
        "❌ Decision Comparison PDF generation failed:",
        error
      );

      alert(
        "Failed to generate Decision Comparison PDF."
      );

    } finally {
      if (document.body.contains(pdfElement)) {
        document.body.removeChild(pdfElement);
      }
    }
  };


  return (
    <div className="decision-comparison-report">

      {/* HEADER */}

      <div className="decision-header">

        <div>

          <h1>
            ⚖️ Decision Comparison
          </h1>

          <p>
            🌍{" "}
            {currentOutputLanguage ||
              currentDocumentLanguage ||
              "Unknown"}
          </p>

        </div>

        <div style={{ textAlign: "right" }}>

          <div className="decision-badge">
            {confidence}% Confidence
          </div>

          <button
            onClick={downloadComparisonPDF}
            style={{
              marginTop: "15px",
              padding: "11px 20px",
              borderRadius: "10px",
              border: "1px solid #111111",
              background: "#111111",
              color: "#ffffff",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            📄 Download PDF
          </button>

        </div>

      </div>


      {/* POSITIONS */}

      <section className="decision-card">

        <h2>
          ⚖️ The Two Positions
        </h2>

        <div className="comparison-cards">

          <div className="upload-box">

            <h3>
              Document A
            </h3>

            <p>
              {report.documentA?.position ||
                "No position identified."}
            </p>

          </div>


          <div className="upload-box">

            <h3>
              Document B
            </h3>

            <p>
              {report.documentB?.position ||
                "No position identified."}
            </p>

          </div>

        </div>

      </section>


      {/* CLAIMS */}

      <section className="decision-card">

        <h2>
          🔎 Document A — Claims
        </h2>

        {report.documentA?.mainClaims?.length > 0 ? (

          report.documentA.mainClaims.map(
            (claim, index) => (

              <div
                className="claim-card"
                key={index}
              >

                <div className="claim-number">
                  Claim {index + 1}
                </div>

                <h3>
                  {claim.claim}
                </h3>

                <div className="claim-status-row">

                  <span
                    className={`claim-status ${getEvidenceStatusClass(
                      claim.evidenceStatus
                    )}`}
                  >
                    {claim.evidenceStatus}
                  </span>

                  <span className="claim-quality">
                    {claim.evidenceQuality}
                  </span>

                </div>

                {claim.evidence?.length > 0 && (

                  <div className="claim-evidence">

                    <strong>
                      Evidence
                    </strong>

                    <ul>

                      {claim.evidence.map(
                        (item, i) => (
                          <li key={i}>
                            {item}
                          </li>
                        )
                      )}

                    </ul>

                  </div>

                )}

                <p>
                  {claim.analysis}
                </p>

              </div>

            )
          )

        ) : (

          <p>
            No major claims identified.
          </p>

        )}

      </section>


      <section className="decision-card">

        <h2>
          🔎 Document B — Claims
        </h2>

        {report.documentB?.mainClaims?.length > 0 ? (

          report.documentB.mainClaims.map(
            (claim, index) => (

              <div
                className="claim-card"
                key={index}
              >

                <div className="claim-number">
                  Claim {index + 1}
                </div>

                <h3>
                  {claim.claim}
                </h3>

                <div className="claim-status-row">

                  <span
                    className={`claim-status ${getEvidenceStatusClass(
                      claim.evidenceStatus
                    )}`}
                  >
                    {claim.evidenceStatus}
                  </span>

                  <span className="claim-quality">
                    {claim.evidenceQuality}
                  </span>

                </div>

                {claim.evidence?.length > 0 && (

                  <div className="claim-evidence">

                    <strong>
                      Evidence
                    </strong>

                    <ul>

                      {claim.evidence.map(
                        (item, i) => (
                          <li key={i}>
                            {item}
                          </li>
                        )
                      )}

                    </ul>

                  </div>

                )}

                <p>
                  {claim.analysis}
                </p>

              </div>

            )
          )

        ) : (

          <p>
            No major claims identified.
          </p>

        )}

      </section>


      {/* AGREEMENTS */}

      <section className="decision-card">

        <h2>
          🤝 Agreements
        </h2>

        {report.agreements?.length > 0 ? (

          report.agreements.map(
            (item, index) => (

              <div
                className="comparison-item"
                key={index}
              >

                <h3>
                  {item.topic}
                </h3>

                <p>
                  {item.analysis}
                </p>

              </div>

            )
          )

        ) : (

          <p>
            No major agreements identified.
          </p>

        )}

      </section>


      {/* DISAGREEMENTS */}

      <section className="decision-card">

        <h2>
          ⚔️ Genuine Disagreements
        </h2>

        {report.disagreements?.length > 0 ? (

          report.disagreements.map(
            (item, index) => (

              <div
                className="comparison-item"
                key={index}
              >

                <h3>
                  {item.topic}
                </h3>

                <div className="comparison-sides">

                  <div>
                    <strong>
                      Document A
                    </strong>

                    <p>
                      {item.documentA}
                    </p>
                  </div>

                  <div>
                    <strong>
                      Document B
                    </strong>

                    <p>
                      {item.documentB}
                    </p>
                  </div>

                </div>

                <p>
                  {item.analysis}
                </p>

              </div>

            )
          )

        ) : (

          <p>
            No genuine disagreements identified.
          </p>

        )}

      </section>


      {/* METHODOLOGY */}

      <section className="decision-card">

        <h2>
          🧪 Methodological Differences
        </h2>

        {report.methodologicalDifferences?.length > 0 ? (

          report.methodologicalDifferences.map(
            (item, index) => (

              <div
                className="comparison-item"
                key={index}
              >

                <h3>
                  {item.factor}
                </h3>

                <p>
                  <strong>
                    Document A:
                  </strong>{" "}
                  {item.documentA}
                </p>

                <p>
                  <strong>
                    Document B:
                  </strong>{" "}
                  {item.documentB}
                </p>

                <p>
                  <strong>
                    Impact:
                  </strong>{" "}
                  {item.impact}
                </p>

              </div>

            )
          )

        ) : (

          <p>
            No major methodological differences identified.
          </p>

        )}

      </section>


      {/* EVIDENCE GAPS */}

      <section className="decision-card">

        <h2>
          ❓ Evidence Gaps
        </h2>

        {report.evidenceGaps?.length > 0 ? (

          report.evidenceGaps.map(
            (item, index) => (

              <div
                className="comparison-item"
                key={index}
              >

                <div className="claim-status-row">

                  <span className="claim-quality">
                    {item.importance}
                  </span>

                </div>

                <h3>
                  {item.gap}
                </h3>

                <p>
                  {item.explanation}
                </p>

              </div>

            )
          )

        ) : (

          <p>
            No major evidence gaps identified.
          </p>

        )}

      </section>


      {/* RESOLUTION */}

      <section className="decision-card decision-main">

        <h2>
          🧠 Final Resolution
        </h2>

        <div className="decision-result">
          {report.resolution?.outcome ||
            "The disagreement cannot currently be resolved"}
        </div>

        <p>
          {report.resolution?.explanation ||
            "Insufficient information was available to determine the resolution."}
        </p>

      </section>


      {/* WHAT WOULD CHANGE RESULT */}

      <section className="decision-card">

        <h2>
          🔄 What Would Change the Result
        </h2>

        {report.whatWouldChangeTheResult?.length > 0 ? (

          <ul>

            {report.whatWouldChangeTheResult.map(
              (item, index) => (
                <li key={index}>
                  {item}
                </li>
              )
            )}

          </ul>

        ) : (

          <p>
            No additional evidence was identified.
          </p>

        )}

      </section>


      {/* SUMMARY */}

      <section className="decision-card recommendation-card">

        <h2>
          📋 Summary
        </h2>

        <p>
          {report.summary ||
            "No summary was provided."}
        </p>

      </section>


      {/* CONFIDENCE */}

      <section className="decision-card confidence-card">

        <h2>
          🎯 Confidence
        </h2>

        <div className="confidence-number">
          {confidence}%
        </div>

        <div className="confidence-bar">

          <div
            className="confidence-fill"
            style={{
              width: `${confidence}%`,
            }}
          />

        </div>

      </section>

    </div>
  );
}

export default DecisionComparisonReport;

