import React from "react";

function LoadingScreen() {
  return (
    <div className="loading-screen">

      <div className="loading-circle"></div>

      <h2>
        AI is analyzing your documents...
      </h2>

      <p>
        Comparing content, finding differences, and generating insights.
      </p>

    </div>
  );
}

export default LoadingScreen;