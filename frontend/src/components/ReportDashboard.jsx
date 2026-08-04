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