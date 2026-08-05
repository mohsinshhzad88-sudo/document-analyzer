function MissingCard({ items }) {

  return (
    <div className="comparison-card">

      <h3>❌ Missing Information</h3>

      {(items || []).map((item,index)=>(

        <div className="item-box" key={index}>

          <h4>
            {item.item}
          </h4>

          <span className="importance">
            🔴 {item.importance}
          </span>

          <p>
            {item.explanation}
          </p>

        </div>

      ))}

    </div>
  );
}

export default MissingCard;