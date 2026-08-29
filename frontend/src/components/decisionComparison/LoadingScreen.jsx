

function LoadingScreen() {
  return (
    <div className="loading-screen">

      <div className="loading-content">

        <div className="loading-spinner"></div>

        <h1> Comparing Evidence</h1>

        <p>
          Analyzing both documents, comparing their claims,
          and evaluating the evidence.
        </p>

        <div className="loading-steps">

          <div>
            ✓ Extracting document content
          </div>

          <div>
            ✓ Identifying competing claims
          </div>

          <div>
            ✓ Comparing supporting evidence
          </div>

          <div>
            ◌ Resolving disagreements
          </div>

        </div>

      </div>

    </div>
  );
}

export default LoadingScreen;