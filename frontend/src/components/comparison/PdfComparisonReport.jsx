import React from "react";

function PdfComparisonReport({ result }) {
  if (!result) return null;

  return (
    <div
      style={{
  width: "794px",
  minHeight: "1123px",
  padding: "40px",
  background: "#ffffff",
  color: "#111827",
  fontFamily: "Arial, sans-serif",
  boxSizing: "border-box",
}}
    >
      
      <div
        style={{
          borderBottom: "2px solid #e5e7eb",
          paddingBottom: "20px",
          marginBottom: "30px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "28px",
          }}
        >
          AI Comparison Report
        </h1>

        <p
          style={{
            marginTop: "8px",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          AI-powered analysis of your documents
        </p>
      </div>

      
      <section style={{ marginBottom: "30px" }}>
        <h2>Overall Score</h2>

        <div
          style={{
            fontSize: "42px",
            fontWeight: "bold",
            marginTop: "10px",
          }}
        >
          {result.score ?? 0}/100
        </div>

        {result.verdict && (
          <p style={{ lineHeight: 1.6 }}>
            <strong>Verdict:</strong> {result.verdict}
          </p>
        )}
      </section>

      
      <section style={{ marginBottom: "30px" }}>
        <h2>Strengths</h2>

        {Array.isArray(result.strengths) &&
          result.strengths.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              • {typeof item === "string" ? item : JSON.stringify(item)}
            </div>
          ))}
      </section>

      

      <section style={{ marginBottom: "30px" }}>
        <h2>Missing Requirements</h2>

        {Array.isArray(result.missing) &&
          result.missing.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              • {typeof item === "string" ? item : JSON.stringify(item)}
            </div>
          ))}
      </section>

      
      <section style={{ marginBottom: "30px" }}>
        <h2>Differences</h2>

        {Array.isArray(result.differences) &&
          result.differences.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              • {typeof item === "string" ? item : JSON.stringify(item)}
            </div>
          ))}
      </section>

     
      <section style={{ marginBottom: "30px" }}>
        <h2>Priority Improvements</h2>

        {Array.isArray(result.priorityImprovements) &&
          result.priorityImprovements.map((item, index) => (
            <div
              key={index}
              style={{
                padding: "10px 0",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              • {typeof item === "string" ? item : JSON.stringify(item)}
            </div>
          ))}
      </section>

     

      <section>
        <h2>Summary</h2>

        <p style={{ lineHeight: 1.7 }}>
          {result.summary || "No summary available."}
        </p>
      </section>

      <div
       
      style={{
              position: "fixed",
              left: "-10000px",
              top: 0,
              width: "794px",
              background: "#ffffff",
            }}
>
  
</div>

    </div>
  );
}

export default PdfComparisonReport;