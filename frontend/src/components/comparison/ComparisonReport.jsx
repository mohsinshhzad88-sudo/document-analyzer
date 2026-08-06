import React from "react";
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

  return (
    <div className="comparison-report">


      <button
        className="new-evaluation-btn"
        onClick={onNewEvaluation}
      >
        ← New Evaluation
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
  items={result.improvements}
/>


<SummaryCard
  text={result.summary}
/>


      </div>


    </div>
  );
}


export default ComparisonReport;