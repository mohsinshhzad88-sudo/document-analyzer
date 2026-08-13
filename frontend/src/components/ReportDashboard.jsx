import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer
} from "recharts";

function ReportDashboard({
  report,
  currentDocumentLanguage,
  documentLanguage,
})
 {
      const cardStyle = {
    background: "rgba(255,255,255,0.85)",
    borderRadius: "24px",
    padding: "25px",
    marginTop: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    border: "1px solid rgba(255,255,255,0.5)",
    backdropFilter: "blur(10px)",
      };

  const score = report.overallScore || 0;
  const scoreData = [
  {
    name: "Score",
    value: score,
  },
];

  

   const getQualityColor = (score) => {
  if(score >= 85) return "#22c55e";
  if(score >= 70) return "#f59e0b";
  return "#ef4444";
};

const getVerdictStyle = (verdict) => {
  switch (verdict?.toLowerCase()) {
    case "excellent":
      return {
        background: "#dcfce7",
        color: "#166534",
      };

    case "good":
      return {
        background: "#dbeafe",
        color: "#1d4ed8",
      };

    case "fair":
      return {
        background: "#fef3c7",
        color: "#92400e",
      };

    case "poor":
      return {
        background: "#fee2e2",
        color: "#991b1b",
      };

    case "high risk":
      return {
        background: "#fecaca",
        color: "#7f1d1d",
      };

    default:
      return {
        background: "#f3f4f6",
        color: "#374151",
      };
  }
};


  const SectionCard = ({ icon, title, children }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.9)",
      padding: "25px",
      borderRadius: "24px",
      marginTop: "22px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.05)",
      transition: "0.3s",
      cursor:"pointer",
    }}

    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-5px)";
      e.currentTarget.style.boxShadow =
        "0 15px 35px rgba(0,0,0,0.15)";
    }}

    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow =
        "0 8px 25px rgba(0,0,0,0.08)";
    }}
  
  >
    <h3
      style={{
        fontSize: "20px",
        marginBottom: "15px",
      }}
    >
      {icon} {title}
    </h3>

    {children}
  </div>
);

  const renderList = (items, keyName) => (
    <ul>
      {items?.map((item, index) => (
        <li key={index} style={{ marginBottom: "8px" }}>
          ✓{" "}
          {typeof item === "object"
            ? item[keyName] || JSON.stringify(item)
            : item}
        </li>
      ))}
    </ul>
  );
      
  async function testUrduJsPDF() {
  try {
    const response = await fetch(
      "/fonts/Jameel%20Noori%20Nastaleeq%20Regular.ttf"
    );

    const fontBuffer = await response.arrayBuffer();

    const uint8Array = new Uint8Array(fontBuffer);

    let binary = "";
    uint8Array.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    const fontBase64 = btoa(binary);

    const doc = new jsPDF();

    doc.addFileToVFS(
      "JameelNooriNastaleeq.ttf",
      fontBase64
    );

    doc.addFont(
      "JameelNooriNastaleeq.ttf",
      "JameelNooriNastaleeq",
      "normal"
    );

    doc.setFont("JameelNooriNastaleeq");
    doc.setFontSize(24);

    doc.text("TEST", 50, 50);

    doc.text("یہ", 50, 100);
    doc.text("ایک", 50, 150);
    doc.text("اردو", 50, 200);

    doc.save("urdu-jsPDF-test.pdf");

    console.log("🔥 jsPDF URDU TEST CREATED 🔥");

  } catch (error) {
    console.error("❌ jsPDF URDU TEST ERROR:", error);
  }
}

const downloadPDF = async () => {

 

  console.log("🔥 NEW PDF CODE IS RUNNING 🔥");
  if (!report) {
    console.error("No report available");
    return;
  }

  const pdfElement = document.createElement("div");

  pdfElement.style.position = "absolute";
  pdfElement.style.left = "-10000px";
  pdfElement.style.top = "0";
  pdfElement.style.width = "794px";
  pdfElement.style.background = "#ffffff";
  pdfElement.style.color = "#1f2937";
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
        value.findings ||
        value.finding ||
        value.risk ||
        value.recommendation ||
        value.description ||
        value.text ||
        value.name ||
        ""
      );
    }

    return fallback;
  };

  const score = Number(report.overallScore) || 0;

  const verdict = report.finalVerdict || "Evaluation Complete";

  const language =
    currentDocumentLanguage ||
    documentLanguage ||
    "Not specified";

  const languageCode = String(language || "")
  .toLowerCase()
  .split("-")[0]
  .split("_")[0];

const rtlLanguages = [
  "ar", // Arabic
  "ur", // Urdu
  "fa", // Persian
  "he", // Hebrew
  "ps", // Pashto
  "sd", // Sindhi
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


  pdfElement.style.fontFamily = textFont;
  pdfElement.style.direction = textDirection;
  pdfElement.style.textAlign = textAlign;

  const quality = report.qualityAnalysis || {};

  const getScoreColor = (value) => {
    if (value >= 85) return "#15803d";
    if (value >= 70) return "#b45309";
    return "#b91c1c";
  };

  const scoreColor = getScoreColor(score);

  const verdictBg =
    score >= 85
      ? "#ecfdf5"
      : score >= 70
        ? "#fffbeb"
        : "#fef2f2";

  const verdictColor =
    score >= 85
      ? "#166534"
      : score >= 70
        ? "#92400e"
        : "#991b1b";

  const renderSectionTitle = (number, title, subtitle = "") => `
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

  const renderList = (items, emptyText) => {
    if (!Array.isArray(items) || items.length === 0) {
      return `
        <div style="
          padding: 14px 4px;
          font-size: 12px;
          color: #6b7280;
        ">
          ${emptyText}
        </div>
      `;
    }

    return items
      .map((item, index) => `
        <div style="
          display: flex;
          gap: 12px;
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
            ${String(index + 1).padStart(2, "0")}
          </div>

          <div style="
            flex: 1;
            font-size: 13px;
            line-height: 1.6;
            color: #374151;

             direction: ${textDirection};
             text-align: ${textAlign};
             font-family: ${textFont};

            unicode-bidi: plaintext;
          ">
            ${safe(getText(item))}
          </div>
        </div>
      `)
      .join("");
  };

  pdfElement.innerHTML = `
    <div style="
      width: 794px;
      min-height: 1123px;
      padding: 54px 58px 42px;
      box-sizing: border-box;
      background: #ffffff;

       direction: ${textDirection};
       text-align: ${textAlign};
       font-family: ${textFont};
    ">

      <!-- HEADER -->

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
          AI Document Audit Report
        </div>

        <div style="
          margin-top: 7px;
          font-size: 12px;
          color: #6b7280;
        ">
          Intelligent document quality and content analysis
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
            Document Type
          </div>

          <div style="
            margin-top: 3px;
            font-size: 12px;
            font-weight: 600;
            color: #374151;
          ">
            ${safe(report.documentType || "Document")}
          </div>
        </div>

        <div style="text-align: right;">
          <div style="
            font-size: 9px;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 1px;
          ">
            Language
          </div>

          <div style="
            margin-top: 3px;
            font-size: 12px;
            font-weight: 600;
            color: #374151;
          ">
            ${safe(language)}
          </div>
        </div>

      </div>

      <!-- EXECUTIVE SUMMARY -->

      ${renderSectionTitle(
        "01",
        "Executive Summary"
      )}

      <div style="
        font-size: 13px;
        line-height: 1.75;
        color: #374151;
        page-break-inside: avoid;

         direction: ${textDirection};
         text-align: ${textAlign};
         font-family: ${textFont};

          unicode-bidi: plaintext;
      ">
        ${safe(
          report.executiveSummary ||
          "No executive summary available."
        )}
      </div>

      <!-- KEY FINDINGS -->

      ${renderSectionTitle(
        "02",
        "Key Findings",
        "Important observations identified during document analysis"
      )}

      <div style="border-top: 1px solid #e5e7eb;">
        ${renderList(
          report.keyFindings,
          "No key findings identified."
        )}
      </div>

      <!-- RISKS -->

      ${renderSectionTitle(
        "03",
        "Risks",
        "Potential issues requiring attention"
      )}

      <div style="border-top: 1px solid #e5e7eb;">
        ${
          Array.isArray(report.risks) &&
          report.risks.length
            ? renderList(report.risks, "")
            : `
              <div style="
                padding: 14px 4px;
                font-size: 12px;
                color: #15803d;
              ">
                ✓ No significant risks detected.
              </div>
            `
        }
      </div>

      <!-- RECOMMENDATIONS -->

      ${renderSectionTitle(
        "04",
        "Recommendations",
        "Suggested actions to improve the document"
      )}

      <div style="border-top: 1px solid #e5e7eb;">
        ${renderList(
          report.recommendations,
          "No recommendations available."
        )}
      </div>

      <!-- QUALITY ANALYSIS -->

      ${renderSectionTitle(
        "05",
        "Document Quality Analysis",
        "Assessment of major document quality dimensions"
      )}

      <div style="
        border: 1px solid #d1d5db;
        background: #fafafa;
        padding: 18px;
        page-break-inside: avoid;
      ">

        ${[
          ["Writing Quality", quality.writingQuality || 0],
          ["Structure", quality.structure || 0],
          ["Themes", quality.themes || 0],
          ["Consistency", quality.consistency || 0]
        ]
          .map(
            ([name, value]) => `
              <div style="margin-bottom: 18px;">
                <div style="
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  font-weight: 600;
                  margin-bottom: 7px;
                  color: #374151;
                ">
                  <span>${name}</span>
                  <span>${value}%</span>
                </div>

                <div style="
                  height: 10px;
                  background: #e5e7eb;
                  overflow: hidden;
                ">
                  <div style="
                    width: ${value}%;
                    height: 100%;
                    background: ${getScoreColor(value)};
                  "></div>
                </div>
              </div>
            `
          )
          .join("")}

      </div>

      <!-- OVERALL SCORE -->

      ${renderSectionTitle(
        "06",
        "Overall Evaluation"
      )}

      <div style="
        display: flex;
        border: 1px solid #d1d5db;
        background: #fafafa;
        page-break-inside: avoid;
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
            Final Verdict
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

      <!-- EVALUATION SUMMARY -->

      ${renderSectionTitle(
        "07",
        "Evaluation Summary"
      )}

      <div style="
        font-size: 13px;
        line-height: 1.75;
        color: #374151;
        page-break-inside: avoid;
      ">
        ${safe(
          report.evaluationSummary ||
          "AI evaluation summary not available."
        )}
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
          Document Analyzer • AI Document Audit Report
        </div>

        <div>
          Confidential Evaluation
        </div>
      </div>

    </div>
  `;

 document.body.appendChild(pdfElement);

console.log("🔥 PDF ELEMENT APPENDED 🔥");

console.log(
  "BROWSER TEXT:",
  pdfElement.querySelector("div")?.innerText
);

console.log("PDF HTML TEST:", pdfElement.innerText);

try {

  // ⭐ WAIT FOR WEB FONTS
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }


   const jameelFont = new FontFace(
  "Jameel Noori Nastaleeq",
  'url("/fonts/Jameel%20Noori%20Nastaleeq%20Regular.ttf")'
);

await jameelFont.load();
document.fonts.add(jameelFont);

const fontResponse = await fetch(
  "/fonts/Jameel%20Noori%20Nastaleeq%20Regular.ttf"
);

const fontBuffer = await fontResponse.arrayBuffer();

const fontBytes = new Uint8Array(fontBuffer);

let fontBinary = "";

fontBytes.forEach((byte) => {
  fontBinary += String.fromCharCode(byte);
});

const jameelFontBase64 = btoa(fontBinary);

console.log("🔥 JAMEEL FONT BASE64 READY");

  // ⭐ FORCE THE EXACT FONTS WE NEED
// ⭐ FORCE THE EXACT FONTS WE NEED


await Promise.all([
  document.fonts.load('400 20px "Noto Nastaliq Urdu"'),
  document.fonts.load('400 20px "Jameel Noori Nastaleeq"'),
  document.fonts.load('400 20px "Noto Sans Arabic"'),
  document.fonts.load('600 20px "Noto Sans Arabic"'),
  document.fonts.load('700 20px "Noto Sans Arabic"'),
  document.fonts.load('400 20px "Noto Sans"'),
  document.fonts.load('600 20px "Noto Sans"'),
  document.fonts.load('700 20px "Noto Sans"'),
  document.fonts.load('400 20px "Noto Sans Devanagari"')
]);

  // Give the browser one more rendering frame
  await new Promise((resolve) =>
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    })
  );

  console.log("🔥 FONTS READY 🔥");

  console.log(
  "Nastaliq loaded:",
  document.fonts.check('400 20px "Noto Nastaliq Urdu"')
);

console.log(
  "Arabic loaded:",
  document.fonts.check('400 20px "Noto Sans Arabic"')
);

  console.log(
  "PDF IMAGES:",
  pdfElement.querySelectorAll("img").length
);

console.log(
  "PDF IMAGE SOURCES:",
  [...pdfElement.querySelectorAll("img")].map(img => img.src)
);

  console.log(
    "PDF SIZE:",
    pdfElement.offsetWidth,
    pdfElement.offsetHeight
  );


  
console.log("🔥 Sending report HTML to Puppeteer...");

const API_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://document-analyzer-two.vercel.app";

console.log("🔥 Sending report HTML to Puppeteer...");
console.log("PDF API:", `${API_URL}/api/generate-pdf`);

const response = await fetch(
  `${API_URL}/api/generate-pdf`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      html: pdfElement.innerHTML,
      jameelFont: jameelFontBase64,
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
  "🔥 PDF received:",
  pdfBlob.size,
  "bytes"
);

const url = URL.createObjectURL(pdfBlob);

const link = document.createElement("a");

link.href = url;
link.download = "AI-Document-Audit-Report.pdf";

document.body.appendChild(link);

link.click();

link.remove();

URL.revokeObjectURL(url);

console.log("🔥 PDF DOWNLOAD COMPLETE 🔥");

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
    <div
      style={{
       marginTop: "20px",
       background: "#f8fafc",
       padding: "30px",
       borderRadius: "30px",
       boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
       textAlign: "left",
      }}
    >

      {/* Header */}
      <div
         style={{
                 ...cardStyle,
                 textAlign:"center",
                 background:"linear-gradient(135deg,#667eea,#764ba2)",
                 color:"white",
                  }}
>
        <h2>
          📄 Document Audit Report
        </h2>

        <p>
          🏷 {report.documentType || "Document"} 
          {"   "}
          🌍 {currentDocumentLanguage || documentLanguage}
        </p>

        <button
  onClick={downloadPDF}
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

<button onClick={testUrduJsPDF}>
  Test Urdu jsPDF
</button>


      </div>

<div style={cardStyle}>
  <h3>📄 Executive Summary</h3>
  <p>{report.executiveSummary}</p>
</div>

<div style={cardStyle}>
  <h3>🔍 Key Findings</h3>

  <ul>
    {report.keyFindings?.map((item,index)=>(
      <li key={index}>
        ✓ {typeof item === "object"
        ? item.findings || item.finding 
        : item}
      </li>
    ))}
  </ul>
</div>


      <SectionCard
        icon="⚠️"
        title="Risks"
      >
        {report.risks?.length > 0
          ? renderList(report.risks, "risk")
          : <p>🟢 No significant risks detected</p>}
      </SectionCard>


      <SectionCard
        icon="💡"
        title="Recommendations"
      >
        {renderList(
          report.recommendations,
          "recommendation"
        )}
      </SectionCard>
<SectionCard
  icon="📈"
  title="Document Quality Analysis"
>

{
[
 ["Writing Quality", report.qualityAnalysis?.writingQuality || 0],
 ["Structure", report.qualityAnalysis?.structure || 0],
 ["Themes", report.qualityAnalysis?.themes || 0],
 ["Consistency", report.qualityAnalysis?.consistency || 0]
].map(([name,value])=>(
  
<div key={name} style={{marginBottom:"22px"}}>

<div
style={{
display:"flex",
justifyContent:"space-between",
fontWeight:"600",
marginBottom:"8px"
}}
>
<span>{name}</span>
<span>{value}%</span>
</div>


<div
style={{
height:"12px",
background:"#e5e7eb",
borderRadius:"20px",
overflow:"hidden"
}}
>

<div
style={{
width:`${value}%`,
height:"100%",
background:getQualityColor(value),
borderRadius:"20px",
transition:"0.5s"
}}
/>

</div>


</div>

))
}

</SectionCard>

      {/* Score */}
     {/* Score */}

<SectionCard
icon="🏆"
title="Overall Score"
>

<div style={{textAlign:"center"}}>


<div
style={{
width:"150px",
height:"150px",
borderRadius:"50%",
background:
`conic-gradient(#6366f1 ${score}%, #e5e7eb 0%)`,
display:"flex",
alignItems:"center",
justifyContent:"center",
margin:"auto"
}}
>


<div
style={{
width:"115px",
height:"115px",
borderRadius:"50%",
background:"white",
display:"flex",
alignItems:"center",
justifyContent:"center",
flexDirection:"column"
}}
>

<span
style={{
fontSize:"42px",
fontWeight:"700"
}}
>
{score}
</span>

<small>
%
</small>


</div>


</div>


<h3>
Document Quality
</h3>


<div
style={{
display: "inline-block",
padding: "8px 20px",
borderRadius: "20px",
fontWeight: "700",
marginBottom: "15px",
...getVerdictStyle(report.finalVerdict)
}}
>
{report.finalVerdict?.toUpperCase()}
</div>


<p>
{report.evaluationSummary || "Ai evaluation not available."}
</p>


</div>


</SectionCard>


    </div>
  );
}

export default ReportDashboard;