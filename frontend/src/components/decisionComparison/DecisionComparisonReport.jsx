

import React from "react";
import "./DecisionComparisonReport.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


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

    const renderEvidenceComparison = () => {
  const documentAClaims = report?.documentA?.mainClaims || [];
  const documentBClaims = report?.documentB?.mainClaims || [];

  const maxClaims = Math.max(
    documentAClaims.length,
    documentBClaims.length
  );

  if (maxClaims === 0) {
    return `
      <div style="
        padding:14px 4px;
        font-size:12px;
        color:#6b7280;
      ">
        No claims available for evidence comparison.
      </div>
    `;
  }

  const getScore = (status = "", quality = "") => {
    const s = status.toLowerCase().trim();
    const q = quality.toLowerCase().trim();

    const scores = {
      supported: {
        strong: 90,
        moderate: 75,
        weak: 60,
        insufficient: 50,
      },

      "partially supported": {
        strong: 70,
        moderate: 55,
        weak: 40,
        insufficient: 30,
      },

      unsupported: {
        strong: 40,
        moderate: 30,
        weak: 20,
        insufficient: 10,
      },

      unclear: {
        strong: 50,
        moderate: 40,
        weak: 30,
        insufficient: 20,
      },
    };

    return scores[s]?.[q] ?? 50;
  };

  const rows = Array.from(
    { length: maxClaims },
    (_, index) => {
      const claimA = documentAClaims[index];
      const claimB = documentBClaims[index];

      const scoreA = claimA
        ? getScore(
            claimA.evidenceStatus,
            claimA.evidenceQuality
          )
        : null;

      const scoreB = claimB
        ? getScore(
            claimB.evidenceStatus,
            claimB.evidenceQuality
          )
        : null;

      return `
        <tr>
          <td style="
            padding:9px 8px;
            border-bottom:1px solid #e5e7eb;
            font-size:11px;
            font-weight:600;
          ">
            Claim ${index + 1}
          </td>

          <td style="
            padding:9px 8px;
            border-bottom:1px solid #e5e7eb;
            text-align:center;
            font-size:12px;
            font-weight:700;
            color:#6366f1;
          ">
            ${scoreA ?? "—"}
          </td>

          <td style="
            padding:9px 8px;
            border-bottom:1px solid #e5e7eb;
            text-align:center;
            font-size:12px;
            font-weight:700;
            color:#111827;
          ">
            ${scoreB ?? "—"}
          </td>
        </tr>
      `;
    }
  ).join("");

  /*
   * Simple SVG chart.
   * SVG is used because the PDF generator can render it
   * reliably without depending on Recharts.
   */

  const chartWidth = 650;
  const chartHeight = 260;

  const left = 45;
  const right = 20;
  const top = 20;
  const bottom = 45;

  const plotWidth = chartWidth - left - right;
  const plotHeight = chartHeight - top - bottom;

  const pointsA = [];
  const pointsB = [];

  for (let i = 0; i < maxClaims; i++) {
    const claimA = documentAClaims[i];
    const claimB = documentBClaims[i];

    const scoreA = claimA
      ? getScore(
          claimA.evidenceStatus,
          claimA.evidenceQuality
        )
      : null;

    const scoreB = claimB
      ? getScore(
          claimB.evidenceStatus,
          claimB.evidenceQuality
        )
      : null;

    const x =
      maxClaims === 1
        ? left + plotWidth / 2
        : left + (i / (maxClaims - 1)) * plotWidth;

    if (scoreA !== null) {
      const y =
        top +
        plotHeight -
        (scoreA / 100) * plotHeight;

      pointsA.push({
        x,
        y,
        score: scoreA,
      });
    }

    if (scoreB !== null) {
      const y =
        top +
        plotHeight -
        (scoreB / 100) * plotHeight;

      pointsB.push({
        x,
        y,
        score: scoreB,
      });
    }
  }

  const pathA = pointsA
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const pathB = pointsB
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`
    )
    .join(" ");

  const gridLines = [0, 25, 50, 75, 100]
    .map((value) => {
      const y =
        top +
        plotHeight -
        (value / 100) * plotHeight;

      return `
        <line
          x1="${left}"
          y1="${y}"
          x2="${chartWidth - right}"
          y2="${y}"
          stroke="#e5e7eb"
          stroke-width="1"
        />

        <text
          x="${left - 8}"
          y="${y + 4}"
          text-anchor="end"
          font-size="9"
          fill="#9ca3af"
        >
          ${value}
        </text>
      `;
    })
    .join("");

  const xLabels = Array.from(
    { length: maxClaims },
    (_, index) => {
      const x =
        maxClaims === 1
          ? left + plotWidth / 2
          : left + (index / (maxClaims - 1)) * plotWidth;

      return `
        <text
          x="${x}"
          y="${chartHeight - 18}"
          text-anchor="middle"
          font-size="9"
          fill="#6b7280"
        >
          Claim ${index + 1}
        </text>
      `;
    }
  ).join("");

  const circlesA = pointsA
    .map(
      (point) => `
        <circle
          cx="${point.x}"
          cy="${point.y}"
          r="4"
          fill="#6366f1"
        />

        <text
          x="${point.x}"
          y="${point.y - 9}"
          text-anchor="middle"
          font-size="9"
          font-weight="700"
          fill="#6366f1"
        >
          ${point.score}
        </text>
      `
    )
    .join("");

  const circlesB = pointsB
    .map(
      (point) => `
        <circle
          cx="${point.x}"
          cy="${point.y}"
          r="4"
          fill="#111827"
        />

        <text
          x="${point.x}"
          y="${point.y - 9}"
          text-anchor="middle"
          font-size="9"
          font-weight="700"
          fill="#111827"
        >
          ${point.score}
        </text>
      `
    )
    .join("");

  return `
    <div style="
      page-break-inside:avoid;
      margin-bottom:20px;
    ">

      <!-- SCORE TABLE -->

      <table style="
        width:100%;
        border-collapse:collapse;
        margin-bottom:18px;
      ">

        <thead>
          <tr style="
            background:#f9fafb;
          ">

            <th style="
              padding:9px 8px;
              text-align:left;
              font-size:10px;
              color:#6b7280;
              text-transform:uppercase;
            ">
              Claim
            </th>

            <th style="
              padding:9px 8px;
              text-align:center;
              font-size:10px;
              color:#6366f1;
              text-transform:uppercase;
            ">
              Document A
            </th>

            <th style="
              padding:9px 8px;
              text-align:center;
              font-size:10px;
              color:#111827;
              text-transform:uppercase;
            ">
              Document B
            </th>

          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>

      </table>


      <!-- CHART -->

      <div style="
        border:1px solid #e5e7eb;
        padding:12px;
        background:#ffffff;
      ">

        <svg
          width="${chartWidth}"
          height="${chartHeight}"
          viewBox="0 0 ${chartWidth} ${chartHeight}"
          xmlns="http://www.w3.org/2000/svg"
          style="
            width:100%;
            height:auto;
            display:block;
          "
        >

          ${gridLines}

          <line
            x1="${left}"
            y1="${top}"
            x2="${left}"
            y2="${top + plotHeight}"
            stroke="#d1d5db"
            stroke-width="1"
          />

          <line
            x1="${left}"
            y1="${top + plotHeight}"
            x2="${chartWidth - right}"
            y2="${top + plotHeight}"
            stroke="#d1d5db"
            stroke-width="1"
          />

          ${pathA
            ? `
              <path
                d="${pathA}"
                fill="none"
                stroke="#6366f1"
                stroke-width="2.5"
              />
            `
            : ""}

          ${pathB
            ? `
              <path
                d="${pathB}"
                fill="none"
                stroke="#111827"
                stroke-width="2.5"
              />
            `
            : ""}

          ${circlesA}
          ${circlesB}
          ${xLabels}

        </svg>


        <!-- LEGEND -->

        <div style="
          display:flex;
          justify-content:center;
          gap:25px;
          margin-top:5px;
          font-size:10px;
          color:#6b7280;
        ">

          <div>
            <span style="
              display:inline-block;
              width:9px;
              height:9px;
              border-radius:50%;
              background:#6366f1;
              margin-right:5px;
            "></span>
            Document A
          </div>

          <div>
            <span style="
              display:inline-block;
              width:9px;
              height:9px;
              border-radius:50%;
              background:#111827;
              margin-right:5px;
            "></span>
            Document B
          </div>

        </div>

      </div>

    </div>
  `;
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
         "Evidence Strength Comparison",
         "Claim-by-claim comparison of evidential strength"
       )}

        ${renderEvidenceComparison()}


        ${sectionTitle(
          "05",
          "Agreements",
          "Where the two documents establish compatible findings"
        )}

        ${renderAgreements()}


        ${sectionTitle(
          "06",
          "Disagreements",
          "Genuine conflicts between the positions"
        )}

        ${renderDisagreements()}


        ${sectionTitle(
          "07",
          "Methodological Differences",
          "Differences that may explain apparently conflicting conclusions"
        )}

        ${renderMethodology()}


        ${sectionTitle(
          "08",
          "Evidence Gaps",
          "Missing evidence that limits the ability to resolve the disagreement"
        )}

        ${renderSimpleList(
          report.evidenceGaps,
          "No major evidence gaps identified."
        )}


        ${sectionTitle(
          "09",
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

const getEvidenceScore = (evidenceStatus, evidenceQuality) => {
  const status = (evidenceStatus || "").toLowerCase().trim();
  const quality = (evidenceQuality || "").toLowerCase().trim();

  const scores = {
    supported: {
      strong: 90,
      moderate: 75,
      weak: 60,
      insufficient: 50,
    },

    "partially supported": {
      strong: 70,
      moderate: 55,
      weak: 40,
      insufficient: 30,
    },

    unsupported: {
      strong: 40,
      moderate: 30,
      weak: 20,
      insufficient: 10,
    },

    unclear: {
      strong: 50,
      moderate: 40,
      weak: 30,
      insufficient: 20,
    },
  };

  return scores[status]?.[quality] ?? 50;
};

const getEvidenceLabel = (status = "", quality = "") => {
  const value = status.toLowerCase().trim();
  const qualityValue = quality.toLowerCase().trim();

  if (
    value === "supported" ||
    value === "partially supported"
  ) {
    if (qualityValue === "strong") return "Strong";
    if (qualityValue === "moderate") return "Moderate";
    if (qualityValue === "weak") return "Weak";
    if (qualityValue === "insufficient") return "Insufficient";
  }

  if (value === "contradicted") return "Contradicted";
  if (value === "unsupported") return "Insufficient";

  return "Unclear";
};

const documentAClaims = report?.documentA?.mainClaims || [];
const documentBClaims = report?.documentB?.mainClaims || [];

const maxClaims = Math.max(
  documentAClaims.length,
  documentBClaims.length
);

const evidenceComparisonData = Array.from(
  { length: maxClaims },
  (_, index) => {
    const claimA = documentAClaims[index];
    const claimB = documentBClaims[index];

    return {
      label: `Claim ${index + 1}`,

      documentA: claimA
  ? getEvidenceScore(
      claimA.evidenceStatus,
      claimA.evidenceQuality
    )
  : null,

documentB: claimB
  ? getEvidenceScore(
      claimB.evidenceStatus,
      claimB.evidenceQuality
    )
  : null,

labelA: claimA
  ? getEvidenceLabel(
      claimA.evidenceStatus,
      claimA.evidenceQuality
    )
  : "N/A",

labelB: claimB
  ? getEvidenceLabel(
      claimB.evidenceStatus,
      claimB.evidenceQuality
    )
  : "N/A",
    };
  }
);
    
    console.log("Document A claims:", documentAClaims);
    console.log("Document B claims:", documentBClaims);

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

      <section className="evidence-trajectory">

  <div className="evidence-trajectory-header">

    <div>
      <span className="visual-label">
        EVIDENCE TRAJECTORY
      </span>

      <h2>Comparative Evidence Strength</h2>

      <p>
        How the evidential strength of each position changes
        across the analyzed claims.
      </p>
    </div>

  </div>

  <div className="evidence-chart-container">

    <ResponsiveContainer width="100%" height={330}>

      <LineChart
        data={evidenceComparisonData}
        margin={{
          top: 20,
          right: 20,
          left: 0,
          bottom: 10,
        }}
      >

        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#e5e7eb"
        />

        <XAxis
          dataKey="label"
          tick={{
            fontSize: 11,
            fill: "#6b7280",
          }}
          axisLine={{
            stroke: "#d1d5db",
          }}
          tickLine={false}
        />

        <YAxis
          domain={[0, 100]}
          ticks={[0, 20, 40, 60, 80, 100]}
          tick={{
            fontSize: 10,
            fill: "#6b7280",
          }}
          axisLine={false}
          tickLine={false}
          width={35}
        />

        <Tooltip
          content={({ active, payload, label }) => {

            if (!active || !payload || !payload.length) {
              return null;
            }

            const point = evidenceComparisonData.find(
              (item) => item.label === label
            );

            return (
              <div className="evidence-tooltip">

                <div className="tooltip-title">
                  {label}
                </div>

                <div className="tooltip-row">
                  <span className="tooltip-document">
                    Document A
                  </span>

                  <strong>
                    {point?.documentA ?? "N/A"}
                  </strong>

                  <small>
                    {point?.labelA}
                  </small>
                </div>

                <div className="tooltip-row">
                  <span className="tooltip-document">
                    Document B
                  </span>

                  <strong>
                    {point?.documentB ?? "N/A"}
                  </strong>

                  <small>
                    {point?.labelB}
                  </small>
                </div>

              </div>
            );
          }}
        />

        <Line
          type="monotone"
          dataKey="documentA"
          name="Document A"
          stroke="#111827"
          strokeWidth={2.5}
          dot={{
            r: 4,
            strokeWidth: 2,
            fill: "#ffffff",
          }}
          activeDot={{
            r: 6,
          }}
          connectNulls={false}
        />

        <Line
          type="monotone"
          dataKey="documentB"
          name="Document B"
          stroke="#64748b"
          strokeWidth={2.5}
          strokeDasharray="6 4"
          dot={{
            r: 4,
            strokeWidth: 2,
            fill: "#ffffff",
          }}
          activeDot={{
            r: 6,
          }}
          connectNulls={false}
        />

      </LineChart>

    </ResponsiveContainer>

  </div>


  <div className="evidence-chart-legend">

    <div className="chart-legend-item">

      <span className="legend-line document-a-line" />

      <span>
        Document A
      </span>

    </div>

    <div className="chart-legend-item">

      <span className="legend-line document-b-line" />

      <span>
        Document B
      </span>

    </div>

  </div>


  <div className="evidence-chart-note">

    <strong>How to read this chart</strong>

    <span>
      Closer lines indicate similar evidential strength.
      Larger separation indicates greater divergence between
      the two positions.
    </span>

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

