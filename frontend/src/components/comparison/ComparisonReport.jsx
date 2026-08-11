import React from "react";
//import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import "./ComparisonReport.css";

import ScoreCard from "./ScoreCard";
import StrengthCard from "./StrengthCard";
import MissingCard from "./MissingCard";
import DifferenceCard from "./DifferenceCard";
import ImprovementCard from "./ImprovementCard";
import SummaryCard from "./SummaryCard";


function ComparisonReport({
  result,
  onNewEvaluation
}) {
  

const downloadPDF = async () => {
  if (!result) {
    console.error("No comparison result available");
    return;
  }

  const pdfElement = document.createElement("div");

  pdfElement.style.position = "absolute";
  pdfElement.style.left = "-10000px";
  pdfElement.style.top = "0";
  pdfElement.style.width = "794px";
  pdfElement.style.background = "#ffffff";
  pdfElement.style.color = "#1f2937";
 pdfElement.style.fontFamily =
  '"Noto Sans", "Noto Sans Arabic", "Segoe UI", Arial, sans-serif';
 
  pdfElement.style.boxSizing = "border-box";

  const safe = (value) => {
    if (value === null || value === undefined) return "";

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  const getText = (value, fallback = "") => {
    if (value === null || value === undefined) {
      return fallback;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }

    if (typeof value === "object") {
      return (
        value.item ||
        value.topic ||
        value.action ||
        value.recommendation ||
        value.description ||
        value.text ||
        value.name ||
        ""
      );
    }

    return fallback;
  };

  const strengths = Array.isArray(result.strengths)
    ? result.strengths
    : [];

  const missing = Array.isArray(result.missing)
    ? result.missing
    : [];

  const differences = Array.isArray(result.differences)
    ? result.differences
    : [];

  const improvements = Array.isArray(result.improvements)
    ? result.improvements
    : [];

  const score = Number(result.score) || 0;

  const verdict =
    result.verdict || "Evaluation Complete";

  const scoreColor =
    score >= 80
      ? "#15803d"
      : score >= 60
        ? "#b45309"
        : "#b91c1c";

  const verdictBg =
    score >= 80
      ? "#ecfdf5"
      : score >= 60
        ? "#fffbeb"
        : "#fef2f2";

  const verdictColor =
    score >= 80
      ? "#166534"
      : score >= 60
        ? "#92400e"
        : "#991b1b";

  const renderSectionTitle = (
    number,
    title,
    subtitle = ""
  ) => `
    <div style="
      margin-top: 30px;
      margin-bottom: 14px;
      page-break-after: avoid;
    ">

      <div style="
        display: flex;
        align-items: baseline;
        gap: 10px;
      ">

        <span style="
          font-size: 11px;
          font-weight: 700;
          color: #2563eb;
          letter-spacing: 1px;
        ">
          ${number}
        </span>

        <span style="
          font-size: 18px;
          font-weight: 700;
          color: #111827;
        ">
          ${title}
        </span>

      </div>

      ${
        subtitle
          ? `
            <div style="
              margin-top: 4px;
              margin-left: 30px;
              font-size: 11px;
              color: #6b7280;
            ">
              ${subtitle}
            </div>
          `
          : ""
      }

      <div style="
        height: 1px;
        background: #d1d5db;
        margin-top: 10px;
      "></div>

    </div>
  `;

  pdfElement.innerHTML = `
    <div style="
      width: 794px;
      min-height: 1123px;
      padding: 54px 58px 42px;
      box-sizing: border-box;
      background: #ffffff;
    ">

      <!-- REPORT HEADER -->

      <div style="
        border-bottom: 2px solid #111827;
        padding-bottom: 22px;
      ">

        <div style="
          font-size: 11px;
          font-weight: 700;
          color: #2563eb;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 8px;
        ">
          DOCUMENT ANALYZER
        </div>

        <div style="
          font-size: 30px;
          font-weight: 700;
          color: #111827;
          line-height: 1.2;
        ">
          AI Comparison Report
        </div>

        <div style="
          margin-top: 7px;
          font-size: 12px;
          color: #6b7280;
        ">
          Intelligent document requirement evaluation
        </div>

      </div>


      <!-- REPORT INFORMATION -->

      <div style="
        display: flex;
        justify-content: space-between;
        padding: 14px 0;
        border-bottom: 1px solid #e5e7eb;
      ">

        <div>
          <div style="
            font-size: 9px;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">
            Report Type
          </div>

          <div style="
            margin-top: 3px;
            font-size: 12px;
            font-weight: 600;
            color: #374151;
          ">
            Document Comparison
          </div>
        </div>

        <div style="
          text-align: right;
        ">
          <div style="
            font-size: 9px;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">
            Evaluation Status
          </div>

          <div style="
            margin-top: 3px;
            font-size: 12px;
            font-weight: 600;
            color: #374151;
          ">
            Completed
          </div>
        </div>

      </div>


      <!-- EVALUATION OVERVIEW -->

      <div style="
        margin-top: 28px;
        page-break-inside: avoid;
      ">

        <div style="
          font-size: 11px;
          font-weight: 700;
          color: #2563eb;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin-bottom: 10px;
        ">
          EVALUATION OVERVIEW
        </div>

        <div style="
          display: flex;
          border: 1px solid #d1d5db;
          background: #fafafa;
        ">

          <div style="
            width: 50%;
            padding: 24px;
            box-sizing: border-box;
            border-right: 1px solid #d1d5db;
            text-align: center;
          ">

            <div style="
              font-size: 10px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 1px;
            ">
              Overall Score
            </div>

            <div style="
              margin-top: 6px;
              font-size: 45px;
              line-height: 1;
              font-weight: 700;
              color: ${scoreColor};
            ">
              ${score}
              <span style="
                font-size: 18px;
                color: #9ca3af;
              ">
                /100
              </span>
            </div>

          </div>


          <div style="
            width: 50%;
            padding: 24px;
            box-sizing: border-box;
            text-align: center;
          ">

            <div style="
              font-size: 10px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 1px;
            ">
              Verdict
            </div>

            <div style="
              display: inline-block;
              margin-top: 12px;
              padding: 7px 13px;
              background: ${verdictBg};
              color: ${verdictColor};
              border: 1px solid ${verdictColor};
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
            ">
              ${safe(verdict)}
            </div>

          </div>

        </div>

      </div>


      <!-- EXECUTIVE SUMMARY -->

      ${
        result.summary
          ? `
            ${renderSectionTitle(
              "00",
              "Executive Summary"
            )}

            <div style="
              font-size: 13px;
              line-height: 1.75;
              color: #374151;
              padding: 0 2px;
              page-break-inside: avoid;
            ">
              ${safe(getText(result.summary))}
            </div>
          `
          : ""
      }


      <!-- STRENGTHS -->

      ${renderSectionTitle(
        "01",
        "Strengths",
        "Requirements and areas successfully addressed"
      )}

      <div style="
        border-top: 1px solid #e5e7eb;
      ">

        ${
          strengths.length
            ? strengths
                .map((item, index) => {
                  const text = getText(
                    item,
                    "Strength identified"
                  );

                  const status =
                    typeof item === "object"
                      ? item?.status
                      : null;

                  return `
                    <div style="
                      display: flex;
                      padding: 13px 4px;
                      border-bottom: 1px solid #e5e7eb;
                      page-break-inside: avoid;
                    ">

                      <div style="
                        width: 32px;
                        font-size: 10px;
                        color: #9ca3af;
                        font-weight: 700;
                      ">
                        ${String(index + 1).padStart(
                          2,
                          "0"
                        )}
                      </div>

                      <div style="
                        flex: 1;
                      ">

                        <div style="
                          font-size: 13px;
                          font-weight: 600;
                          color: #111827;
                          line-height: 1.5;
                        ">
                          ${safe(text)}
                        </div>

                        ${
                          status
                            ? `
                              <div style="
                                margin-top: 3px;
                                font-size: 10px;
                                color: #15803d;
                                font-weight: 600;
                              ">
                                ✓ ${safe(status)}
                              </div>
                            `
                            : ""
                        }

                      </div>

                    </div>
                  `;
                })
                .join("")
            : `
              <div style="
                padding: 14px 4px;
                font-size: 12px;
                color: #6b7280;
              ">
                No strengths identified.
              </div>
            `
        }

      </div>


      <!-- MISSING -->

      ${renderSectionTitle(
        "02",
        "Missing Requirements",
        "Requirements not sufficiently addressed"
      )}

      <div style="
        border-top: 1px solid #e5e7eb;
      ">

        ${
          missing.length
            ? missing
                .map((item, index) => {
                  const text = getText(
                    item,
                    "Missing requirement"
                  );

                  const importance =
                    typeof item === "object"
                      ? item?.importance
                      : null;

                  const explanation =
                    typeof item === "object"
                      ? item?.explanation
                      : null;

                  const priority =
                    String(
                      importance || ""
                    ).toLowerCase();

                  const priorityColor =
                    priority === "high"
                      ? "#b91c1c"
                      : priority === "medium"
                        ? "#b45309"
                        : "#6b7280";

                  return `
                    <div style="
                      padding: 14px 4px;
                      border-bottom: 1px solid #e5e7eb;
                      page-break-inside: avoid;
                    ">

                      <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        gap: 15px;
                      ">

                        <div style="
                          display: flex;
                          gap: 12px;
                          flex: 1;
                        ">

                          <div style="
                            font-size: 10px;
                            color: #9ca3af;
                            font-weight: 700;
                            padding-top: 2px;
                          ">
                            ${String(index + 1).padStart(
                              2,
                              "0"
                            )}
                          </div>

                          <div>

                            <div style="
                              font-size: 13px;
                              font-weight: 600;
                              color: #111827;
                              line-height: 1.5;
                            ">
                              ${safe(text)}
                            </div>

                            ${
                              explanation
                                ? `
                                  <div style="
                                    margin-top: 5px;
                                    font-size: 11px;
                                    line-height: 1.6;
                                    color: #6b7280;
                                  ">
                                    ${safe(explanation)}
                                  </div>
                                `
                                : ""
                            }

                          </div>

                        </div>

                        ${
                          importance
                            ? `
                              <div style="
                                padding: 4px 8px;
                                border: 1px solid ${priorityColor};
                                color: ${priorityColor};
                                font-size: 9px;
                                font-weight: 700;
                                text-transform: uppercase;
                                white-space: nowrap;
                              ">
                                ${safe(importance)}
                              </div>
                            `
                            : ""
                        }

                      </div>

                    </div>
                  `;
                })
                .join("")
            : `
              <div style="
                padding: 14px 4px;
                font-size: 12px;
                color: #15803d;
              ">
                ✓ No missing requirements identified.
              </div>
            `
        }

      </div>


      <!-- DIFFERENCES -->

      ${renderSectionTitle(
        "03",
        "Key Differences",
        "Important discrepancies identified during comparison"
      )}

      <div style="
        border-top: 1px solid #e5e7eb;
      ">

        ${
          differences.length
            ? differences
                .map((item, index) => {
                  const topic =
                    typeof item === "object"
                      ? item?.topic ||
                        item?.item
                      : item;

                  const analysis =
                    typeof item === "object"
                      ? item?.analysis ||
                        item?.explanation
                      : null;

                  return `
                    <div style="
                      padding: 14px 4px;
                      border-bottom: 1px solid #e5e7eb;
                      page-break-inside: avoid;
                    ">

                      <div style="
                        display: flex;
                        gap: 12px;
                      ">

                        <div style="
                          font-size: 10px;
                          color: #9ca3af;
                          font-weight: 700;
                        ">
                          ${String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div style="
                          flex: 1;
                        ">

                          <div style="
                            font-size: 13px;
                            font-weight: 600;
                            color: #111827;
                          ">
                            ${safe(
                              getText(
                                topic,
                                "Difference identified"
                              )
                            )}
                          </div>

                          ${
                            analysis
                              ? `
                                <div style="
                                  margin-top: 5px;
                                  font-size: 11px;
                                  line-height: 1.6;
                                  color: #6b7280;
                                ">
                                  ${safe(analysis)}
                                </div>
                              `
                              : ""
                          }

                        </div>

                      </div>

                    </div>
                  `;
                })
                .join("")
            : `
              <div style="
                padding: 14px 4px;
                font-size: 12px;
                color: #6b7280;
              ">
                No significant differences identified.
              </div>
            `
        }

      </div>


      <!-- IMPROVEMENTS -->

      ${renderSectionTitle(
        "04",
        "Recommended Improvements",
        "Actions that can improve document compliance"
      )}

      <div style="
        border-top: 1px solid #e5e7eb;
      ">

        ${
          improvements.length
            ? improvements
                .map((item, index) => {
                  const action =
                    typeof item === "object"
                      ? item?.action ||
                        item?.recommendation ||
                        item?.item ||
                        item?.description
                      : item;

                  const priority =
                    typeof item === "object"
                      ? item?.priority
                      : null;

                  const priorityLower =
                    String(
                      priority || ""
                    ).toLowerCase();

                  const priorityColor =
                    priorityLower === "high"
                      ? "#b91c1c"
                      : priorityLower === "medium"
                        ? "#b45309"
                        : "#2563eb";

                  return `
                    <div style="
                      padding: 14px 4px;
                      border-bottom: 1px solid #e5e7eb;
                      page-break-inside: avoid;
                    ">

                      <div style="
                        display: flex;
                        gap: 12px;
                      ">

                        <div style="
                          font-size: 10px;
                          color: #9ca3af;
                          font-weight: 700;
                        ">
                          ${String(index + 1).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        <div style="
                          flex: 1;
                        ">

                          ${
                            priority
                              ? `
                                <div style="
                                  display: inline-block;
                                  margin-bottom: 5px;
                                  padding: 3px 7px;
                                  border: 1px solid ${priorityColor};
                                  color: ${priorityColor};
                                  font-size: 9px;
                                  font-weight: 700;
                                  text-transform: uppercase;
                                ">
                                  ${safe(priority)} Priority
                                </div>
                              `
                              : ""
                          }

                          <div style="
                            font-size: 13px;
                            line-height: 1.6;
                            color: #374151;
                          ">
                            ${safe(
                              getText(
                                action,
                                "Recommended improvement"
                              )
                            )}
                          </div>

                        </div>

                      </div>

                    </div>
                  `;
                })
                .join("")
            : `
              <div style="
                padding: 14px 4px;
                font-size: 12px;
                color: #6b7280;
              ">
                No priority improvements identified.
              </div>
            `
        }

      </div>


      <!-- CONCLUSION -->

      ${renderSectionTitle(
        "05",
        "Conclusion"
      )}

      <div style="
        font-size: 13px;
        line-height: 1.75;
        color: #374151;
        page-break-inside: avoid;
      ">

        ${
          result.summary
            ? safe(getText(result.summary))
            : `
              The evaluated document received an overall
              score of ${score}/100 and was classified as
              "${safe(verdict)}".
            `
        }

      </div>


      <!-- FOOTER -->

      <div style="
        margin-top: 42px;
        padding-top: 12px;
        border-top: 1px solid #d1d5db;
        display: flex;
        justify-content: space-between;
        font-size: 9px;
        color: #9ca3af;
      ">

        <div>
          Document Analyzer • AI Comparison Report
        </div>

        <div>
          Confidential Evaluation
        </div>

      </div>

    </div>
  `;

  

  document.body.appendChild(pdfElement);

  console.log(
  "BROWSER URDU TEXT:",
  pdfElement.querySelector("div")?.innerText
);

  console.log("PDF HTML TEST:", pdfElement.innerText);

  const testUrdu = document.createElement("div");

testUrdu.style.position = "absolute";
testUrdu.style.left = "-10000px";
testUrdu.style.top = "0";
testUrdu.style.width = "794px";
testUrdu.style.padding = "30px";
testUrdu.style.background = "#ffffff";
testUrdu.style.color = "#000000";
testUrdu.style.fontFamily =
  '"Noto Sans", "Noto Sans Arabic", "Segoe UI", Arial, sans-serif';
testUrdu.style.fontSize = "20px";
testUrdu.style.direction = "rtl";
testUrdu.style.textAlign = "right";

testUrdu.innerText =
  "یہ ایک اردو ٹیسٹ ہے جس میں حروف صحیح طرح سے جڑے ہونے چاہئیں۔";

document.body.appendChild(testUrdu);
console.log("URDU TEST ELEMENT:", testUrdu);

  try {
    await new Promise((resolve) =>
      setTimeout(resolve, 300)
    );

    console.log(
      "PDF SIZE:",
      pdfElement.offsetWidth,
      pdfElement.offsetHeight
    );

    const canvas = await html2canvas(pdfElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    console.log(
      "CANVAS SIZE:",
      canvas.width,
      canvas.height
    );

    const image = canvas.toDataURL(
      "image/jpeg",
      0.98
    );

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = 210;
    const pdfHeight = 297;

    const imgWidth = pdfWidth;

    const imgHeight =
      (canvas.height * pdfWidth) /
      canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(
      image,
      "JPEG",
      0,
      position,
      imgWidth,
      imgHeight
    );

    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;

      pdf.addPage();

      pdf.addImage(
        image,
        "JPEG",
        0,
        position,
        imgWidth,
        imgHeight
      );

      heightLeft -= pdfHeight;
    }

    pdf.save("AI-Comparison-Report.pdf");

  } catch (error) {
    console.error(
      "PDF generation failed:",
      error
    );
  } finally {
    if (document.body.contains(pdfElement)) {
      document.body.removeChild(pdfElement);
    }
  }
};

  return (
    <div className="comparison-report">


      <button
        className="new-evaluation-btn"
        onClick={onNewEvaluation}
      >
        ← New Evaluation
      </button>

      <button
        className="download-pdf-btn"
        onClick={downloadPDF}
         >
       📄 Download PDF
       </button>

      <div className="report-header">

        <h1>
          📊 AI Comparison Report
        </h1>

        <p>
          AI-powered analysis of your documents
        </p>

      </div>



      <ScoreCard
        data={result}
      />



      <div className="report-grid">



       
<StrengthCard
  items={result.strengths}
/>


<MissingCard
  items={result.missing}
/>


<DifferenceCard
  items={result.differences}
/>


<ImprovementCard
  items={result.priorityImprovements}
/>



<SummaryCard
  text={result.summary}
/>


      </div>

<div
 
  
>  

  

 </div>

    </div>
  );
}


export default ComparisonReport;