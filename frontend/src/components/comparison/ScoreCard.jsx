function ScoreCard({ data }) {
  return (
    <div className="comparison-card score-card">

      <h3>📈 Comparison Score</h3>

      <div className="score-number">
        {data.score}
        <span>/100</span>
      </div>

      <div className="verdict">
        🎯 {data.verdict}
      </div>

    </div>
  );
}

export default ScoreCard;