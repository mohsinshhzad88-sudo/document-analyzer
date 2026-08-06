function UploadScreen({
  referenceFile,
  setReferenceFile,
  mainFile,
  setMainFile,
  evaluateDocument,
  documentType,
   detectReference,
  setDocumentType,
  message
}) {

  return (
    
        <div className="upload-screen">

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
    </div>
  );
}

export default UploadScreen;