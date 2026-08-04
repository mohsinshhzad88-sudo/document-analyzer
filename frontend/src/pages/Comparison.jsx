import React, { useState } from "react";

function Comparison() {
  const [referenceFile, setReferenceFile] = useState(null);
  const [mainFile, setMainFile] = useState(null);
  const [evaluated, setEvaluated] = useState(false);
  const [result, setResult] = useState(null);


  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://document-analyzer-two.vercel.app";




const evaluateDocument = async () => {

  const formData = new FormData();

  formData.append("reference", referenceFile);

  formData.append("document", mainFile);


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

    
    setResult(data.result);
    setEvaluated(true);


  } catch(error) {

    console.error(error);

  }

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
          onChange={(e) =>
            setReferenceFile(e.target.files[0])
          }
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
            onChange={(e) =>
              setReferenceFile(e.target.files[0])
            }
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

      <h3>📈 Comparison Score</h3>

      <h1>
        {result.score}/100
      </h1>



      <h3>✅ Matching Information</h3>


      {result.matching.map((item,index)=>(
         <p key={index}>
      ✓ {typeof item === "object" ? JSON.stringify(item) : item}
           </p>
        ))}


      <h3>❌ Missing Information</h3>

      {result.missing.map((item,index)=>(
        <p key={index}>
      •{typeof item === "object" ? JSON.stringify(item) : item}
          </p>
        ))}


      <h3>⚠ Differences</h3>

      {result.differences.map((item,index)=>(
  <p key={index}>
    • {
      typeof item === "object"
      ? `Reference: ${item.reference} | Main: ${item.main}`
      : item
    }
  </p>
))}


      <h3>💡 Suggestions</h3>

      {result.suggestions.map((item,index)=>(
       <p key={index}>
      • {typeof item === "object" ? JSON.stringify(item) : item}
    </p>
))}


      <h3>📝 Summary</h3>

      <p>
        {result.summary}
      </p>

    </>

  )}

</div>

  </div> /* comparison-page */
  );
}


export default Comparison;