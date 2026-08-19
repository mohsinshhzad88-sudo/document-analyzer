import React from "react";

function DecisionReport({
  report,
  currentDocumentLanguage,
  currentOutputLanguage,
}) {
  if (!report) return null;

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://document-analyzer-two.vercel.app";

  const downloadDecisionPDF = async () => {
    if (!report) return;

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

// Direction for actual document content
const contentDirection = textDirection;
const contentAlign = textAlign;

// UI/report labels always remain LTR
const uiDirection = "ltr";
const uiAlign = "left";

const textFont =
  languageCode === "ur"
    ? '"Jameel Noori Nastaleeq", "Noto Sans Arabic", "Noto Sans", sans-serif'
    : isRTL
      ? '"Noto Sans Arabic", "Noto Sans", "Segoe UI", Arial, sans-serif'
      : '"Noto Sans", "Noto Sans Devanagari", "Segoe UI", Arial, sans-serif';

      pdfElement.style.direction = textDirection;
      pdfElement.style.textAlign = textAlign;
      pdfElement.style.fontFamily = textFont;

    const safe = (value) => {
      if (value === null || value === undefined) return "";

      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    };

    const getLanguage =
      currentOutputLanguage ||
      currentDocumentLanguage ||
      "Unknown";

    const getList = (items, emptyText) => {
  if (!Array.isArray(items) || items.length === 0) {
    return `
      <div style="
        padding:14px 4px;
        font-size:12px;
        color:#6b7280;
        direction:${contentDirection};
        text-align:${contentAlign};
        font-family:${textFont};
      ">
        ${safe(emptyText)}
      </div>
    `;
  }

  return items
    .map(
      (item, index) => `
        <div style="
          display:flex;
          flex-direction:row;
          gap:12px;
          padding:13px 4px;
          border-bottom:1px solid #e5e7eb;
          page-break-inside:avoid;
          direction:ltr;
        ">

          <div style="
            width:32px;
            flex-shrink:0;
            font-size:10px;
            color:#9ca3af;
            font-weight:700;
            text-align:left;
            direction:ltr;
          ">
            ${String(index + 1).padStart(2, "0")}
          </div>

          <div style="
            flex:1;
            font-size:13px;
            line-height:1.8;
            color:#374151;
            direction:${contentDirection};
            text-align:${contentAlign};
            font-family:${textFont};
            unicode-bidi:plaintext;
            word-break:normal;
            overflow-wrap:break-word;
          ">
            ${safe(item)}
          </div>

        </div>
      `
    )
    .join("");
};

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
      text-align:left;
    ">

      <span style="
        font-size:11px;
        font-weight:700;
        color:#6366f1;
        letter-spacing:1px;
        direction:ltr;
      ">
        ${number}
      </span>

      <span style="
        font-size:18px;
        font-weight:700;
        color:#111827;
        direction:ltr;
        text-align:left;
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
            direction:ltr;
            text-align:left;
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

    const confidence = Math.min(
      Math.max(Number(report.confidence) || 0, 0),
      100
    );

    const confidenceColor =
      confidence >= 85
        ? "#15803d"
        : confidence >= 70
        ? "#b45309"
        : "#b91c1c";

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

        <!-- HEADER -->

        <div style="
          border-bottom:2px solid #111827;
          padding-bottom:22px;
          direction:ltr;
          text-align:left;
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
            AI Decision Analysis Report
          </div>

          <div style="
            margin-top:7px;
            font-size:12px;
            color:#6b7280;
          ">
            Evidence-based decision evaluation
          </div>

        </div>


        <!-- REPORT INFORMATION -->

        <div style="
          display:flex;
          justify-content:space-between;
          padding:14px 0;
          border-bottom:1px solid #e5e7eb;
          direction:ltr;
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
              color:#374151;
            ">
              Decision Analysis
            </div>
          </div>

          <div style="
            direction:ltr;
            text-align:right;
          ">

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
              color:#374151;
              direction:${contentDirection};
              text-align:right;
              font-family:${textFont};
            ">
              ${safe(getLanguage)}
            </div>

          </div>

        </div>


        <!-- DECISION -->

        ${sectionTitle(
          "01",
          "Decision",
          "Recommended decision based on the available evidence"
        )}

        <div style="
          border:1px solid #c7d2fe;
          background:#eef2ff;
          padding:22px;
          page-break-inside:avoid;
          direction:${contentDirection};
          text-align:${contentAlign};
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
            Recommended Choice
          </div>

          <div style="
            margin-top:8px;
            font-size:24px;
            font-weight:700;
            color:#111827;
            direction:${contentDirection};
            text-align:${contentAlign};
            font-family:${textFont};
          ">
            ${safe(
              report.decision ||
                "Insufficient information"
            )}
          </div>

          ${
            report.decisionSummary
              ? `
                <div style="
                  margin-top:12px;
                  font-size:13px;
                  line-height:1.7;
                  color:#374151;
                  direction:${contentDirection};
                  text-align:${contentAlign};
                  font-family:${textFont};
                  unicode-bidi:plaintext;
                ">
                  ${safe(report.decisionSummary)}
                </div>
              `
              : ""
          }

        </div>


        <!-- OPTIONS -->

        ${sectionTitle(
          "02",
          "Options",
          "Choices identified in the decision"
        )}

        <div style="
          border-top:1px solid #e5e7eb;
          direction:ltr;
        ">
          ${getList(
            report.options,
            "No options identified."
          )}
        </div>


        <!-- CRITERIA -->

        ${sectionTitle(
          "03",
          "Criteria",
          "Factors used to evaluate the decision"
        )}

        <div style="
          border-top:1px solid #e5e7eb;
          direction:ltr;
        ">
          ${getList(
            report.criteria,
            "No decision criteria identified."
          )}
        </div>


        <!-- EVIDENCE -->

        ${sectionTitle(
          "04",
          "Evidence",
          "Evidence extracted from the decision document"
        )}

        <div style="
          border-top:1px solid #e5e7eb;
          direction:ltr;
        ">
          ${getList(
            report.evidence,
            "No evidence identified."
          )}
        </div>


        <!-- TRADE-OFFS -->

        ${sectionTitle(
          "05",
          "Trade-offs",
          "Advantages and disadvantages considered"
        )}

        <div style="
          border-top:1px solid #e5e7eb;
          direction:ltr;
        ">
          ${getList(
            report.tradeOffs,
            "No major trade-offs identified."
          )}
        </div>


        <!-- RISKS -->

        ${sectionTitle(
          "06",
          "Risks",
          "Potential consequences identified by the analysis"
        )}

        <div style="
          border-top:1px solid #e5e7eb;
          direction:ltr;
        ">
          ${getList(
            report.risks,
            "No significant risks identified."
          )}
        </div>


        <!-- MISSING INFORMATION -->

        ${sectionTitle(
          "07",
          "Missing Information",
          "Information that could improve decision confidence"
        )}

        <div style="
          border-top:1px solid #e5e7eb;
          direction:ltr;
        ">
          ${getList(
            report.missingInformation,
            "No important missing information identified."
          )}
        </div>


        <!-- RECOMMENDATION -->

        ${sectionTitle(
          "08",
          "Recommendation",
          "Final recommendation based on the available evidence"
        )}

        <div style="
          border:1px solid #d1d5db;
          background:#fafafa;
          padding:20px;
          font-size:13px;
          line-height:1.75;
          color:#374151;
          page-break-inside:avoid;
          direction:${contentDirection};
          text-align:${contentAlign};
          font-family:${textFont};
          unicode-bidi:plaintext;
        ">
          ${safe(
            report.recommendation ||
              "No recommendation could be made from the available evidence."
          )}
        </div>


        <!-- CONFIDENCE -->

        ${sectionTitle(
          "09",
          "Confidence",
          "Confidence in the evidence-based decision"
        )}

        <div style="
          border:1px solid #d1d5db;
          background:#fafafa;
          padding:24px;
          text-align:center;
          page-break-inside:avoid;
          direction:ltr;
        ">

          <div style="
            font-size:10px;
            color:#6b7280;
            text-transform:uppercase;
            letter-spacing:1px;
          ">
            Analysis Confidence
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
            direction:ltr;
          ">

            <div style="
              width:${confidence}%;
              height:100%;
              background:${confidenceColor};
            "></div>

          </div>

        </div>


        <!-- FOOTER -->

        <div style="
          margin-top:42px;
          padding-top:12px;
          border-top:1px solid #d1d5db;
          display:flex;
          justify-content:space-between;
          font-size:9px;
          color:#9ca3af;
          direction:ltr;
          text-align:left;
        ">

          <div>
            Document Analyzer • AI Decision Analysis Report
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

      console.log("🔥 DECISION PDF HTML READY 🔥");
      console.log("Language:", language);
      console.log("RTL:", isRTL);

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
        "🔥 DECISION PDF RECEIVED:",
        pdfBlob.size,
        "bytes"
      );

      const url = URL.createObjectURL(pdfBlob);

      const link = document.createElement("a");

      link.href = url;
      link.download =
        "AI-Decision-Analysis-Report.pdf";

      document.body.appendChild(link);

      link.click();

      link.remove();

      URL.revokeObjectURL(url);

      console.log(
        "🔥 DECISION PDF DOWNLOAD COMPLETE 🔥"
      );

    } catch (error) {
      console.error(
        "❌ Decision PDF generation failed:",
        error
      );

      alert(
        "Failed to generate Decision Analysis PDF."
      );

    } finally {
      if (document.body.contains(pdfElement)) {
        document.body.removeChild(pdfElement);
      }
    }
  };

  return (
    <div className="decision-report">

      {/* HEADER */}

      <div className="decision-header">

        <div>
          <h1>🧠 Decision Analysis</h1>

          <p>
            🌍{" "}
            {currentOutputLanguage ||
              currentDocumentLanguage ||
              "Unknown"}
          </p>
        </div>

        <div style={{ textAlign: "right" }}>

          <div className="decision-badge">
            {report.confidence ?? 0}% Confidence
          </div>

          <button
            onClick={downloadDecisionPDF}
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


      {/* DECISION */}

      <section className="decision-card decision-main">

        <h2>🏆 Decision</h2>

        <div className="decision-result">
          {report.decision ||
            "Insufficient information"}
        </div>

        {report.decisionSummary && (
          <p>{report.decisionSummary}</p>
        )}

      </section>


      {/* OPTIONS */}

      <section className="decision-card">

        <h2>🔀 Options</h2>

        {report.options?.length > 0 ? (
          <ul>
            {report.options.map((option, index) => (
              <li key={index}>{option}</li>
            ))}
          </ul>
        ) : (
          <p>No options identified.</p>
        )}

      </section>


      {/* CRITERIA */}

      <section className="decision-card">

        <h2>🎯 Criteria</h2>

        {report.criteria?.length > 0 ? (
          <ul>
            {report.criteria.map((criterion, index) => (
              <li key={index}>{criterion}</li>
            ))}
          </ul>
        ) : (
          <p>No decision criteria identified.</p>
        )}

      </section>


      {/* EVIDENCE */}

      <section className="decision-card">

        <h2>🔎 Evidence</h2>

        {report.evidence?.length > 0 ? (
          <ul>
            {report.evidence.map((item, index) => (
              <li key={index}>
                ✓ {item}
              </li>
            ))}
          </ul>
        ) : (
          <p>No evidence identified.</p>
        )}

      </section>


      {/* TRADE-OFFS */}

      <section className="decision-card">

        <h2>⚖️ Trade-offs</h2>

        {report.tradeOffs?.length > 0 ? (
          <ul>
            {report.tradeOffs.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No major trade-offs identified.</p>
        )}

      </section>


      {/* RISKS */}

      <section className="decision-card">

        <h2>⚠️ Risks</h2>

        {report.risks?.length > 0 ? (
          <ul>
            {report.risks.map((risk, index) => (
              <li key={index}>
                ⚠️ {risk}
              </li>
            ))}
          </ul>
        ) : (
          <p>No significant risks identified.</p>
        )}

      </section>


      {/* MISSING INFORMATION */}

      <section className="decision-card">

        <h2>❓ Missing Information</h2>

        {report.missingInformation?.length > 0 ? (
          <ul>
            {report.missingInformation.map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ul>
        ) : (
          <p>
            No important missing information identified.
          </p>
        )}

      </section>


      {/* RECOMMENDATION */}

      <section className="decision-card recommendation-card">

        <h2>💡 Recommendation</h2>

        <p>
          {report.recommendation ||
            "No recommendation could be made from the available evidence."}
        </p>

      </section>


      {/* CONFIDENCE */}

      <section className="decision-card confidence-card">

        <h2>🎯 Confidence</h2>

        <div className="confidence-number">
          {report.confidence ?? 0}%
        </div>

        <div className="confidence-bar">

          <div
            className="confidence-fill"
            style={{
              width: `${Math.min(
                Math.max(
                  report.confidence ?? 0,
                  0
                ),
                100
              )}%`,
            }}
          />

        </div>

      </section>

    </div>
  );
}

export default DecisionReport;