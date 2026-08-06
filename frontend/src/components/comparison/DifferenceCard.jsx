function DifferenceCard({ items }) {

  return (

    <div className="comparison-card comparison-span-2 difference-card">

      <h3>⚠ Differences</h3>


      {(items || []).map((item,index)=>(

        <div className="difference-box" key={index}>


          <h4>
            {item.topic}
          </h4>


          <p>
            <b>Reference:</b>
            <br/>
            {item.reference?.join(", ")}
          </p>


          <p>
            <b>Submission:</b>
            <br/>
            {item.submission?.join(", ")}
          </p>


          <p>
            <b>Analysis:</b>
            <br/>
            {item.analysis}
          </p>


        </div>

      ))}

    </div>

  );
}

export default DifferenceCard;