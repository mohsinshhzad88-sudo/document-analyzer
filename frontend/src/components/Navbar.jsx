import React, { useState } from "react";

function Navbar({
  showComparison,
  setShowComparison,
  analysisMode,
  setAnalysisMode,
  comparisonMode,
  setComparisonMode,
}) {
  const [showAnalyzeMenu, setShowAnalyzeMenu] = useState(false);
  const [showCompareMenu, setShowCompareMenu] = useState(false);  

  const selectAnalyzeMode = (mode) => {
    setAnalysisMode(mode);
    setShowComparison(false);
    setShowAnalyzeMenu(false);
    setShowCompareMenu(false);
  };

  const selectComparisonMode = (mode) => {
    setComparisonMode(mode);
    setShowComparison(true);
    setShowCompareMenu(false);
    setShowAnalyzeMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        📄 Document Analyzer AI
      </div>

      <div className="nav-links">

        {/* ANALYZE DROPDOWN */}
        <div className="nav-dropdown">
          <button
            className={!showComparison ? "active" : ""}
            onClick={() => {
              setShowAnalyzeMenu(!showAnalyzeMenu);
              setShowCompareMenu(false);
            }}
          >
            {analysisMode === "decision"
            ? "🧠 Decision Analysis"
            : "📄 Document Analysis"}{" ▼"}
          </button>

          {showAnalyzeMenu && (
            <div className="dropdown-menu">
              <button
                onClick={() => selectAnalyzeMode("document")}
              >
                📄 Document Analysis
              </button>

              <button
                onClick={() => selectAnalyzeMode("decision")}
              >
                🧠 Decision Analysis
              </button>
            </div>
          )}
        </div>

        {/* COMPARE DROPDOWN */}
        <div className="nav-dropdown">
          <button
            className={showComparison ? "active" : ""}
            onClick={() => {
              setShowCompareMenu(!showCompareMenu);
              setShowAnalyzeMenu(false);
            }}
          >
           {comparisonMode === "decision"
            ? "🧠 Decision Comparison"
           : "📄 Document Comparison"}{" ▼"}
          </button>

          {showCompareMenu && (
            <div className="dropdown-menu">
              <button
                onClick={() => selectComparisonMode("document")}
              >
                📄 Document Comparison
              </button>

              <button
                onClick={() => selectComparisonMode("decision")}
              >
                🧠 Decision Comparison
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;