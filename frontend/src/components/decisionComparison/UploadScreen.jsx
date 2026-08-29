function UploadScreen({
  documentA,
  setDocumentA,
  documentB,
  setDocumentB,
  compareDocuments,
}) {
  return (
    <div className="upload-screen">

      <h1> Decision Comparison</h1>

      <p>
        Compare competing claims and determine what the evidence actually supports.
      </p>

      <div className="comparison-cards">

        {/* DOCUMENT A */}
        <div className="upload-box">

          <h2> Document A</h2>

          <p>
            First research paper, argument, or position.
          </p>

          {!documentA ? (
            <label className="file-button">
               Choose Document A

              <input
                type="file"
                hidden
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files[0];

                  if (file) {
                    setDocumentA(file);
                  }
                }}
              />
            </label>
          ) : (
            <>
              <p> {documentA.name}</p>

              <p className="ready-text">
                ✓ Ready
              </p>

              <div className="button-group">

                <label className="file-button">
                  Replace

                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];

                      if (file) {
                        setDocumentA(file);
                      }
                    }}
                  />
                </label>

                <button
                  onClick={() => setDocumentA(null)}
                >
                  Remove
                </button>

              </div>
            </>
          )}

        </div>


        {/* DOCUMENT B */}
        <div className="upload-box">

          <h2> Document B</h2>

          <p>
            Second research paper, argument, or position.
          </p>

          {!documentB ? (
            <label className="file-button">
               Choose Document B

              <input
                type="file"
                hidden
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files[0];

                  if (file) {
                    setDocumentB(file);
                  }
                }}
              />
            </label>
          ) : (
            <>
              <p> {documentB.name}</p>

              <p className="ready-text">
                ✓ Ready
              </p>

              <div className="button-group">

                <label className="file-button">
                  Replace

                  <input
                    type="file"
                    hidden
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];

                      if (file) {
                        setDocumentB(file);
                      }
                    }}
                  />
                </label>

                <button
                  onClick={() => setDocumentB(null)}
                >
                  Remove
                </button>

              </div>
            </>
          )}

        </div>

      </div>


      {/* COMPARE BUTTON */}

      <button
        className="evaluate-btn"
        disabled={!documentA || !documentB}
        onClick={compareDocuments}
      >
         Compare Evidence
      </button>

    </div>
  );
}

export default UploadScreen;
