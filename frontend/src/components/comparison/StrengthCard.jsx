function StrengthCard({ items }) {

  return (
    <div className="comparison-card">

      <h3>✅ Correctly Matched</h3>

      {(items || []).map((item,index)=>(

        <div className="item-box" key={index}>

          <h4>
            ✓ {item.item}
          </h4>

          <p>
            {item.status}
          </p>

        </div>

      ))}

    </div>
  );
}

export default StrengthCard;