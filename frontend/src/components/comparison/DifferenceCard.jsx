import React, { useState } from "react";

function DifferenceCard({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="comparison-card comparison-span-2 difference-card">

      <h3>⚠ Differences</h3>

      {(items || []).map((item, index) => (
        <div className="accordion-item" key={index}>

          <button
            className="accordion-header"
            onClick={() =>
              setOpenIndex(openIndex === index ? null : index)
            }
          >
            <span>{item.topic}</span>

            <span className="accordion-arrow">
              {openIndex === index ? "▲" : "▼"}
            </span>
          </button>

          {openIndex === index && (
            <div className="accordion-content difference-content">

              <p>
                <b>Reference:</b>
                <br />
                {item.reference?.join(", ")}
              </p>

              <p>
                <b>Submission:</b>
                <br />
                {item.submission?.join(", ")}
              </p>

              <p>
                <b>Analysis:</b>
                <br />
                {item.analysis}
              </p>

            </div>
          )}

        </div>
      ))}

    </div>
  );
}

export default DifferenceCard;