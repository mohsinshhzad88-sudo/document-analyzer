import React, { useState } from "react";

function MissingCard({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="comparison-card">
      <h3> Missing Information</h3>

      {(items || []).map((item, index) => (
        <div className="accordion-item" key={index}>

          <button
            className="accordion-header"
            onClick={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
          >
            <span>{item.item}</span>

            <span className="accordion-right">
              <span className="importance">
                 {item.importance}
              </span>

              <span className="accordion-arrow">
                {openIndex === index ? "▲" : "▼"}
              </span>
            </span>
          </button>

          {openIndex === index && (
            <div className="accordion-content">
              <p>{item.explanation}</p>
            </div>
          )}

        </div>
      ))}
    </div>
  );
}

export default MissingCard;