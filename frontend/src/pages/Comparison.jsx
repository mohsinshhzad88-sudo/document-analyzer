import React, { useState } from "react";
import ScoreCard from "../components/comparison/ScoreCard";
import StrengthCard from "../components/comparison/StrengthCard";
import MissingCard from "../components/comparison/MissingCard";
import DifferenceCard from "../components/comparison/DifferenceCard";
import ImprovementCard from "../components/comparison/ImprovementCard";
import SummaryCard from "../components/comparison/SummaryCard";
import "../components/comparison/ComparisonCards.css";

function Comparison() {
  const [referenceFile, setReferenceFile] = useState(null);
  const [referenceType, setReferenceType] = useState("");
  const [mainFile, setMainFile] = useState(null);
  const [evaluated, setEvaluated] = useState(false);
  const [result, setResult] = useState(null);
  const [referenceLanguage, setReferenceLanguage] = useState("");

  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://document-analyzer-two.vercel.app";




const evaluateDocument = async () => {

  const formData = new FormData();

  formData.append("reference", referenceFile);

  formData.append("document", mainFile);
  
  formData.append("referenceType", referenceType);


  try {

    const response = await fetch(
      `${API_URL}/api/evaluate`,
      {
        method: "POST",
        body: formData,
      }
    );


    const data = await response.json();

    console.log(data);
     setReferenceType(data.referenceType);
     

    
    setResult(data.result);
    setEvaluated(true);


  } catch(error) {

    console.error(error);

  }

};

const detectReference = async (file) => {

const formData = new FormData();

  formData.append("document", file);

  formData.append("documentType", "Auto Detect");
  formData.append("language", "Auto Detect");

  const response = await fetch(
    "http://localhost:5000/api/detect-reference-type",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();

  console.log(data);

  setReferenceType(data.referenceType);
  setReferenceLanguage("English");
};

  return (
    <div className="comparison-page">

      <h1>📊 AI Document Evaluation</h1>

      <p>
        Evaluate documents against an active reference.
      </p>

      <div className="comparison-cards">

      {/* Active Reference */}
<div className="upload-box">

  <h2>📘 Active Reference</h2>

  {!referenceFile ? (
    <>
      <p>No reference loaded.</p>

      <label className="file-button">
        📘 Choose Reference

        <input
          type="file"
          hidden
          onChange={(e) => {
           const file = e.target.files[0];

           setReferenceFile(file);

           detectReference(file);
}}
        />
      </label>
    </>
  ) : (
    <>
      <p>📘 {referenceFile.name}</p>

      <p className="ready-text">
        ✓ Ready
      </p>

      <div className="button-group">

        <label className="file-button">
          Replace

          <input
            type="file"
            hidden
           onChange={(e) => {
              const file = e.target.files[0];

              setReferenceFile(file);

              detectReference(file);
                  }}
          />
        </label>

        <button
          onClick={() => setReferenceFile(null)}
        >
          Remove
        </button>

      </div>
    </>
  )}

</div>
      <div className="upload-box">

  <h2>📄 Main Document</h2>

  {!mainFile ? (
    <>
      <p>No document selected.</p>

      <label className="file-button">
        📄 Choose Document

        <input
          type="file"
          hidden
          onChange={(e) =>
            setMainFile(e.target.files[0])
          }
        />
      </label>
    </>
  ) : (
    <>
      <p>📄 {mainFile.name}</p>

      <label className="file-button">
        Replace

        <input
          type="file"
          hidden
          onChange={(e) =>
            setMainFile(e.target.files[0])
          }
        />
      </label>
    </>
  )}
      </div> 

    </div> 
     
     <button 
  className="evaluate-btn"
  disabled={!referenceFile || !mainFile}
  onClick={evaluateDocument}
>
  🤖 Evaluate Document
</button>


<div className="result-box">

  {evaluated && (
    <button
      className="evaluate-btn"
      onClick={() => {
        setMainFile(null);
        setEvaluated(false);
        setResult(null);
      }}
    >
      📄 Evaluate Another Document
    </button>
  )}

  <h2>📊 Evaluation Result</h2>


  {!result ? (

    <p>
      Upload a reference and document to start evaluation.
    </p>

  ) : (

 <>
  <div className="comparison-results">

    <ScoreCard 
      data={result}
    />

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
</>

  )}

</div>

  </div> /* comparison-page */
  );
}


export default Comparison;