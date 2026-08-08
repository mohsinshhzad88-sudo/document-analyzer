import React, { useState } from "react";

function StrengthCard({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="comparison-card">
      <h3>✅ Correctly Matched</h3>

      {(items || []).map((item, index) => (
        <div className="accordion-item" key={index}>

          <button
            className="accordion-header"
            onClick={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
          >
            <span>✓ {item.item}</span>
            <span className="accordion-arrow">
              {openIndex === index ? "▲" : "▼"}
            </span>
          </button>

          {openIndex === index && (
            <div className="accordion-content">
              <p>{item.status}</p>
            </div>
          )}

        </div>
      ))}
    </div>
  );
}

export default StrengthCard;