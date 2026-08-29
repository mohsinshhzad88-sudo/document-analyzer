function ImprovementCard({ items }) {

  return (

    <div className="comparison-card">

      <h3> Priority Improvements</h3>


      {(items || []).map((item,index)=>(

        <div className="item-box" key={index}>

          <h4>
            {item.priority} Priority
          </h4>

          <p>
            {item.action}
          </p>

        </div>

      ))}


    </div>

  );
}

export default ImprovementCard;