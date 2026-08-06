function ScoreCard({ data }) {

  const matched = data.strengths?.length || 0;
  const missing = data.missing?.length || 0;
  const differences = data.differences?.length || 0;

  return (

    <div className="score-hero comparison-span-2">

    

      <p>Overall Evaluation</p>

      <div className="hero-score">

        <span>{data.score}</span>

        <small>/100</small>

      </div>

      <div className="hero-verdict">

        {data.verdict}

      </div>

      <div className="hero-stats">

        <div>

          <h3>{matched}</h3>

          <p>Matched</p>

        </div>

        <div>

          <h3>{missing}</h3>

          <p>Missing</p>

        </div>

        <div>

          <h3>{differences}</h3>

          <p>Differences</p>

        </div>

      </div>

    </div>

  );

}

export default ScoreCard;