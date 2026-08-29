import React from "react";
import "./TaxAssessmentReport.css";

function TaxAssessmentReport({
  assessment,
  analysis,
  files,
}) {

  if (!analysis) {
    return null;
  }


  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://document-analyzer-two.vercel.app";


  /*
   * ============================================
   * HELPERS
   * ============================================
   */

  const parseAmount = (value) => {

    if (
      value === null ||
      value === undefined
    ) {
      return null;
    }

    if (typeof value === "number") {
      return Number.isFinite(value)
        ? value
        : null;
    }

    if (typeof value !== "string") {
      return null;
    }

    const cleaned =
      value
        .replace(/,/g, "")
        .replace(/[^\d.-]/g, "");

    if (!cleaned) {
      return null;
    }

    const number = Number(cleaned);

    return Number.isFinite(number)
      ? number
      : null;

  };


  const formatCurrency = (value) => {

  const amount = parseAmount(value);

  if (amount === null) {
    return "Not established";
  }

  return `PKR ${new Intl.NumberFormat("en-PK", {
    maximumFractionDigits: 0
  }).format(amount)}`;

};


  const getSalaryRecord = () => {

    if (
      !assessment?.income?.employment
    ) {
      return null;
    }

    return assessment.income.employment.find(
      (item) =>
        item.source === "Salary Record"
    );

  };


  const salaryRecord =
    getSalaryRecord();


  const inconsistencies =
    Array.isArray(
      assessment?.inconsistencies
    )
      ? assessment.inconsistencies
      : [];


  const missingInformation =
    Array.isArray(
      assessment?.missingInformation
    )
      ? assessment.missingInformation
      : [];


  const confidence =
    Math.min(
      Math.max(
        Number(
          analysis.confidence
        ) || 0,
        0
      ),
      100
    );


  /*
   * ============================================
   * CONFIRMED INFORMATION
   * ============================================
   */

  const confirmedItems = [];


  if (
    salaryRecord?.employerName
  ) {

    confirmedItems.push(
      `Employer identified: ${salaryRecord.employerName}`
    );

  }


  const bankStatement =
    assessment?.financialEvidence?.find(
      (item) =>
        item.type === "Bank Statement"
    );


  const bankSalary =
    parseAmount(
      bankStatement?.salaryCredits
    );


  const reportedNet =
    salaryRecord?.netSalary?.amount;


  if (
    bankSalary !== null &&
    reportedNet !== null &&
    Math.abs(
      bankSalary -
      reportedNet
    ) <= 1
  ) {

    confirmedItems.push(
      `Bank salary credit matches reported net salary: ${formatCurrency(
        bankSalary
      )}`
    );

  }


  if (
    Number(
      assessment?.totals?.taxWithheld
    ) > 0
  ) {

    confirmedItems.push(
      `Annualized tax withholding identified: ${formatCurrency(
        assessment.totals.taxWithheld
      )}`
    );

  }


  /*
   * ============================================
   * PDF
   * ============================================
   */
const downloadTaxPDF = async () => {

  const pdfElement = document.createElement("div");

  pdfElement.style.position = "absolute";
  pdfElement.style.left = "-10000px";
  pdfElement.style.top = "0";
  pdfElement.style.width = "794px";
  pdfElement.style.background = "#ffffff";
  pdfElement.style.color = "#1f2937";
  pdfElement.style.boxSizing = "border-box";
  pdfElement.style.fontFamily =
    '"Noto Sans", "Segoe UI", Arial, sans-serif';
pdfElement.style.direction = "ltr";
pdfElement.style.textAlign = "left";

  /*
   * =========================================================
   * HELPERS
   * =========================================================
   */

  const safe = (value) => {

    if (
      value === null ||
      value === undefined
    ) {
      return "";
    }

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  };


  const sectionTitle = (
    number,
    title,
    subtitle = ""
  ) => `

    <div style="
      margin-top:28px;
      margin-bottom:14px;
      page-break-after:avoid;
    ">

      <table style="
        width:100%;
        border-collapse:collapse;
      ">

        <tr>

          <td style="
            width:34px;
            vertical-align:top;
          ">

            <div style="
              font-size:10px;
              font-weight:700;
              color:#6366f1;
              letter-spacing:1.5px;
              padding-top:2px;
            ">
              ${safe(number)}
            </div>

          </td>


          <td>

            <div style="
              font-size:18px;
              line-height:1.25;
              font-weight:700;
              color:#111827;
            ">
              ${safe(title)}
            </div>

            ${
              subtitle
                ? `
                  <div style="
                    margin-top:4px;
                    font-size:10px;
                    color:#6b7280;
                    line-height:1.5;
                  ">
                    ${safe(subtitle)}
                  </div>
                `
                : ""
            }

          </td>

        </tr>

      </table>


      <div style="
        height:1px;
        background:#d1d5db;
        margin-top:9px;
      "></div>

    </div>

  `;


  const renderBulletList = (
    items,
    emptyText = "None identified."
  ) => {

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {

      return `
        <div style="
          padding:8px 0;
          font-size:11px;
          color:#6b7280;
        ">
          ${safe(emptyText)}
        </div>
      `;

    }


    return items
      .map(
        (item, index) => `

          <table style="
            width:100%;
            border-collapse:collapse;
            page-break-inside:avoid;
          ">

            <tr>

              <td style="
                width:24px;
                vertical-align:top;
                padding:8px 0;
              ">

                <div style="
                  width:18px;
                  height:18px;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  background:#eef2ff;
                  color:#4338ca;
                  font-size:9px;
                  font-weight:700;
                ">
                  ${String(index + 1).padStart(2, "0")}
                </div>

              </td>


              <td style="
                vertical-align:top;
                padding:8px 0 8px 8px;
                border-bottom:1px solid #e5e7eb;
              ">

                <div style="
                  font-size:11px;
                  line-height:1.7;
                  color:#374151;
                ">
                  ${safe(item)}
                </div>

              </td>

            </tr>

          </table>

        `
      )
      .join("");

  };


  /*
   * =========================================================
   * EXECUTIVE OVERVIEW
   * =========================================================
   */

  const executiveSummary =
    analysis?.summary ||
    analysis?.overallAssessment ||
    "No executive overview was provided.";


  /*
   * =========================================================
   * PRIMARY FINDING
   * =========================================================
   */

  const salaryMismatch =
    inconsistencies.find(
      (item) =>
        item.type ===
        "Salary Calculation Mismatch"
    );


  const otherInconsistencies =
    inconsistencies.filter(
      (item) =>
        item !== salaryMismatch
    );


  /*
   * =========================================================
   * CONFIDENCE
   * =========================================================
   */

  const confidenceColor =
    confidence >= 85
      ? "#15803d"
      : confidence >= 70
      ? "#b45309"
      : "#b91c1c";


  /*
   * =========================================================
   * FINANCIAL SNAPSHOT
   * =========================================================
   */

  const financialCards = [

    [
      "Gross Income",
      formatCurrency(
        assessment?.totals?.grossIncome
      )
    ],

    [
      "Tax Withheld",
      formatCurrency(
        assessment?.totals?.taxWithheld
      )
    ],

    [
      "Allowances",
      formatCurrency(
        salaryRecord?.allowances?.annualized
      )
    ],

    [
      "Deductions",
      formatCurrency(
        salaryRecord?.deductions?.annualized
      )
    ]

  ];


  /*
   * =========================================================
   * TAX POSITION
   * =========================================================
   */

  const taxRows = [

    [
      "Taxable Income",
      analysis?.taxOverview?.find(
        (x) =>
          String(x)
            .toLowerCase()
            .startsWith("taxable income")
      ) || "Not established"
    ],

    [
      "Tax Assessed",
      analysis?.taxOverview?.find(
        (x) =>
          String(x)
            .toLowerCase()
            .startsWith("tax assessed")
      ) || "Not established"
    ],

    [
      "Tax Paid",
      analysis?.taxOverview?.find(
        (x) =>
          String(x)
            .toLowerCase()
            .startsWith("tax paid")
      ) || "Not established"
    ],

    [
      "Tax Due",
      analysis?.taxOverview?.find(
        (x) =>
          String(x)
            .toLowerCase()
            .startsWith("tax due")
      ) || "Not established"
    ]

  ];


  /*
   * =========================================================
   * BUILD PDF
   * =========================================================
   */

  pdfElement.innerHTML = `

    <div style="
      width:794px;
      min-height:1123px;
      padding:54px 58px 42px;
      box-sizing:border-box;
      background:#ffffff;
      color:#1f2937;
      direction:ltr;
      text-align:left;
    ">


      <!-- =================================================
           REPORT HEADER
      ================================================== -->

      <table style="
        width:100%;
        border-collapse:collapse;
        border-bottom:2px solid #111827;
      ">

        <tr>

          <td style="
            padding-bottom:18px;
          ">

            <div style="
              font-size:10px;
              font-weight:700;
              color:#6366f1;
              letter-spacing:2.5px;
              text-transform:uppercase;
            ">
              DOCUMENT ANALYZER
            </div>


            <div style="
              margin-top:8px;
              font-size:31px;
              line-height:1.15;
              font-weight:750;
              color:#111827;
            ">
              Tax Assessment Report
            </div>


            <div style="
              margin-top:7px;
              font-size:11px;
              line-height:1.6;
              color:#6b7280;
            ">
              Financial Evidence &amp; Tax Position Review
            </div>

          </td>


          <td style="
            width:110px;
            vertical-align:bottom;
            text-align:right;
            padding-bottom:18px;
          ">

            <div style="
              font-size:9px;
              color:#9ca3af;
              text-transform:uppercase;
              letter-spacing:1px;
            ">
              Report
            </div>

            <div style="
              margin-top:4px;
              font-size:12px;
              font-weight:700;
              color:#111827;
            ">
              Tax Analysis
            </div>

          </td>

        </tr>

      </table>


      <!-- =================================================
           REPORT METADATA
      ================================================== -->

      <table style="
        width:100%;
        border-collapse:collapse;
      ">

        <tr>

          <td style="
            width:33.33%;
            padding:13px 10px 13px 0;
            border-bottom:1px solid #e5e7eb;
          ">

            <div style="
              font-size:8px;
              color:#9ca3af;
              text-transform:uppercase;
              letter-spacing:1px;
            ">
              Taxpayer
            </div>

            <div style="
              margin-top:4px;
              font-size:12px;
              font-weight:700;
              color:#111827;
            ">
              ${safe(
                assessment?.taxpayer?.name ||
                "Not established"
              )}
            </div>

          </td>


          <td style="
            width:33.33%;
            padding:13px 10px;
            border-bottom:1px solid #e5e7eb;
          ">

            <div style="
              font-size:8px;
              color:#9ca3af;
              text-transform:uppercase;
              letter-spacing:1px;
            ">
              Tax Year
            </div>

            <div style="
              margin-top:4px;
              font-size:12px;
              font-weight:700;
              color:#111827;
            ">
              ${safe(
                assessment?.taxpayer?.taxYear ||
                "Not established"
              )}
            </div>

          </td>


          <td style="
            width:33.33%;
            padding:13px 0 13px 10px;
            text-align:right;
            border-bottom:1px solid #e5e7eb;
          ">

            <div style="
              font-size:8px;
              color:#9ca3af;
              text-transform:uppercase;
              letter-spacing:1px;
            ">
              Analysis Confidence
            </div>

            <div style="
              margin-top:4px;
              font-size:12px;
              font-weight:700;
              color:${confidenceColor};
            ">
              ${confidence}%
            </div>

          </td>

        </tr>

      </table>


      <!-- =================================================
           00 EXECUTIVE OVERVIEW
      ================================================== -->

      ${sectionTitle(
        "00",
        "Executive Overview",
        "High-level interpretation of the submitted evidence"
      )}

      <div style="
        padding:18px;
        border:1px solid #e5e7eb;
        background:#fafafa;
        page-break-inside:avoid;
      ">

        <div style="
          font-size:12px;
          line-height:1.85;
          color:#374151;
        ">
          ${safe(executiveSummary)}
        </div>

      </div>


      <!-- =================================================
           01 FINANCIAL SNAPSHOT
      ================================================== -->

      ${sectionTitle(
        "01",
        "Financial Snapshot",
        "Key financial figures established by the assessment engine"
      )}


      <table style="
        width:100%;
        border-collapse:separate;
        border-spacing:8px;
        margin-left:-8px;
        margin-right:-8px;
      ">

        <tr>

          ${financialCards
            .slice(0, 2)
            .map(
              ([label, value]) => `

                <td style="
                  width:50%;
                  border:1px solid #e5e7eb;
                  background:#fafafa;
                  padding:16px;
                  vertical-align:top;
                  page-break-inside:avoid;
                ">

                  <div style="
                    font-size:8px;
                    color:#6b7280;
                    text-transform:uppercase;
                    letter-spacing:.8px;
                  ">
                    ${safe(label)}
                  </div>

                  <div style="
                    margin-top:7px;
                    font-size:20px;
                    font-weight:750;
                    color:#111827;
                  ">
                    ${safe(value)}
                  </div>

                </td>

              `
            )
            .join("")}

        </tr>


        <tr>

          ${financialCards
            .slice(2, 4)
            .map(
              ([label, value]) => `

                <td style="
                  width:50%;
                  border:1px solid #e5e7eb;
                  background:#fafafa;
                  padding:16px;
                  vertical-align:top;
                  page-break-inside:avoid;
                ">

                  <div style="
                    font-size:8px;
                    color:#6b7280;
                    text-transform:uppercase;
                    letter-spacing:.8px;
                  ">
                    ${safe(label)}
                  </div>

                  <div style="
                    margin-top:7px;
                    font-size:20px;
                    font-weight:750;
                    color:#111827;
                  ">
                    ${safe(value)}
                  </div>

                </td>

              `
            )
            .join("")}

        </tr>

      </table>


      <!-- =================================================
           02 ASSESSMENT STATUS
      ================================================== -->

      ${sectionTitle(
        "02",
        "Assessment Status",
        "Findings identified during deterministic validation"
      )}


      ${
        salaryMismatch
          ? `

            <div style="
              border:1px solid #fed7aa;
              background:#fff8f1;
              padding:18px;
              page-break-inside:avoid;
            ">

              <table style="
                width:100%;
                border-collapse:collapse;
              ">

                <tr>

                  <td>

                    <div style="
                      font-size:9px;
                      font-weight:700;
                      color:#b45309;
                      text-transform:uppercase;
                      letter-spacing:1px;
                    ">
                      ATTENTION REQUIRED
                    </div>

                    <div style="
                      margin-top:5px;
                      font-size:17px;
                      font-weight:750;
                      color:#111827;
                    ">
                      Salary Calculation Mismatch
                    </div>

                    ${
                      salaryMismatch.employer
                        ? `
                          <div style="
                            margin-top:4px;
                            font-size:10px;
                            color:#6b7280;
                          ">
                            Employer:
                            ${safe(
                              salaryMismatch.employer
                            )}
                          </div>
                        `
                        : ""
                    }

                  </td>


                  <td style="
                    width:90px;
                    text-align:right;
                    vertical-align:top;
                  ">

                    <div style="
                      display:inline-block;
                      padding:6px 9px;
                      background:#ffedd5;
                      color:#9a3412;
                      font-size:8px;
                      font-weight:700;
                    ">
                      REVIEW
                    </div>

                  </td>

                </tr>

              </table>


              <table style="
                width:100%;
                border-collapse:separate;
                border-spacing:8px;
                margin-top:13px;
                margin-left:-8px;
              ">

                <tr>

                  <td style="
                    width:33.33%;
                    background:#ffffff;
                    border:1px solid #e5e7eb;
                    padding:12px;
                  ">

                    <div style="
                      font-size:8px;
                      color:#6b7280;
                      text-transform:uppercase;
                    ">
                      Reported Net
                    </div>

                    <div style="
                      margin-top:5px;
                      font-size:15px;
                      font-weight:700;
                      color:#111827;
                    ">
                      ${formatCurrency(
                        salaryMismatch.reportedNetSalary
                      )}
                    </div>

                  </td>


                  <td style="
                    width:33.33%;
                    background:#ffffff;
                    border:1px solid #e5e7eb;
                    padding:12px;
                  ">

                    <div style="
                      font-size:8px;
                      color:#6b7280;
                      text-transform:uppercase;
                    ">
                      Calculated Net
                    </div>

                    <div style="
                      margin-top:5px;
                      font-size:15px;
                      font-weight:700;
                      color:#111827;
                    ">
                      ${formatCurrency(
                        salaryMismatch.calculatedNetSalary
                      )}
                    </div>

                  </td>


                  <td style="
                    width:33.33%;
                    background:#fff7ed;
                    border:1px solid #fed7aa;
                    padding:12px;
                  ">

                    <div style="
                      font-size:8px;
                      color:#9a3412;
                      text-transform:uppercase;
                    ">
                      Difference
                    </div>

                    <div style="
                      margin-top:5px;
                      font-size:15px;
                      font-weight:700;
                      color:#b45309;
                    ">
                      ${formatCurrency(
                        salaryMismatch.difference
                      )}
                    </div>

                  </td>

                </tr>

              </table>


              <div style="
                margin-top:12px;
                padding-top:11px;
                border-top:1px solid #fed7aa;
                font-size:11px;
                line-height:1.75;
                color:#374151;
              ">
                ${safe(
                  salaryMismatch.explanation
                )}
              </div>

            </div>

          `
          : `
            <div style="
              border:1px solid #bbf7d0;
              background:#f0fdf4;
              padding:15px;
              color:#166534;
              font-size:11px;
              font-weight:600;
            ">
              No primary calculation inconsistency was identified.
            </div>
          `
      }


      ${
        otherInconsistencies.length > 0
          ? `

            <div style="
              margin-top:10px;
              padding:12px 15px;
              border:1px solid #e5e7eb;
              background:#fafafa;
              page-break-inside:avoid;
            ">

              <div style="
                font-size:9px;
                font-weight:700;
                color:#6b7280;
                text-transform:uppercase;
                letter-spacing:.8px;
                margin-bottom:7px;
              ">
                Additional Validation Findings
              </div>

              ${otherInconsistencies
                .map(
                  (item, index) => `

                    <div style="
                      padding:8px 0;
                      border-bottom:1px solid #e5e7eb;
                      page-break-inside:avoid;
                    ">

                      <div style="
                        font-size:11px;
                        font-weight:700;
                        color:#111827;
                      ">
                        ${String(index + 1).padStart(2, "0")}
                        —
                        ${safe(
                          formatTitle(
                            item.type
                          )
                        )}
                      </div>

                      ${
                        item.explanation
                          ? `
                            <div style="
                              margin-top:4px;
                              font-size:10px;
                              line-height:1.65;
                              color:#4b5563;
                            ">
                              ${safe(
                                item.explanation
                              )}
                            </div>
                          `
                          : ""
                      }

                    </div>

                  `
                )
                .join("")}

            </div>

          `
          : ""
      }


      <!-- =================================================
           03 CONFIRMED EVIDENCE
      ================================================== -->

      ${sectionTitle(
        "03",
        "Confirmed Evidence",
        "Information independently supported by the submitted documents"
      )}


      <div style="
        border:1px solid #d1fae5;
        background:#fbfffc;
        padding:8px 15px;
      ">

        ${
          confirmedItems.length > 0
            ? confirmedItems
                .map(
                  (item, index) => `

                    <table style="
                      width:100%;
                      border-collapse:collapse;
                    ">

                      <tr>

                        <td style="
                          width:26px;
                          padding:9px 0;
                          vertical-align:top;
                        ">

                          <div style="
                            width:19px;
                            height:19px;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            background:#dcfce7;
                            color:#166534;
                            font-size:10px;
                            font-weight:800;
                          ">
                            ✓
                          </div>

                        </td>


                        <td style="
                          padding:9px 0 9px 6px;
                          border-bottom:1px solid #e5e7eb;
                          font-size:11px;
                          line-height:1.7;
                          color:#374151;
                        ">

                          ${safe(item)}

                        </td>

                      </tr>

                    </table>

                  `
                )
                .join("")
            : `
                <div style="
                  padding:10px 0;
                  font-size:11px;
                  color:#6b7280;
                ">
                  No independently confirmed items were identified.
                </div>
              `
        }

      </div>


      <!-- =================================================
           04 TAX POSITION
      ================================================== -->

      ${sectionTitle(
        "04",
        "Tax Position",
        "Tax figures reported or established from the submitted evidence"
      )}


      <table style="
        width:100%;
        border-collapse:collapse;
        border:1px solid #e5e7eb;
      ">

        ${taxRows
          .map(
            ([label, value]) => `

              <tr>

                <td style="
                  width:55%;
                  padding:11px 14px;
                  border-bottom:1px solid #e5e7eb;
                  font-size:10px;
                  color:#6b7280;
                ">
                  ${safe(label)}
                </td>

                <td style="
                  padding:11px 14px;
                  border-bottom:1px solid #e5e7eb;
                  text-align:right;
                  font-size:11px;
                  font-weight:700;
                  color:#111827;
                ">
                  ${safe(value)}
                </td>

              </tr>

            `
          )
          .join("")}

      </table>


      <!-- =================================================
           05 INCOME SOURCES
      ================================================== -->

      ${sectionTitle(
        "05",
        "Income Sources",
        "Income supported by the submitted financial evidence"
      )}

      <div style="
        border:1px solid #e5e7eb;
        padding:8px 14px;
      ">

        ${renderBulletList(
          analysis?.incomeSources,
          "No supported income sources were identified."
        )}

      </div>


      <!-- =================================================
           06 INFORMATION GAPS
      ================================================== -->

      ${sectionTitle(
        "06",
        "Information Gaps",
        "Important information that remains unavailable or cannot be independently established"
      )}

      <div style="
        border:1px solid #e5e7eb;
        background:#fafafa;
        padding:8px 14px;
      ">

        ${
          missingInformation.length > 0
            ? renderBulletList(
                missingInformation,
                "No material information gaps were identified."
              )
            : `
              <div style="
                padding:10px 0;
                color:#166534;
                font-size:11px;
              ">
                No material information gaps were identified.
              </div>
            `
        }

      </div>


      <!-- =================================================
           07 DOCUMENTS REVIEWED
      ================================================== -->

      ${sectionTitle(
        "07",
        "Documents Reviewed",
        "Source documents included in this assessment"
      )}


      ${
        files?.length
          ? files
              .map(
                (file, index) => `

                  <table style="
                    width:100%;
                    border-collapse:collapse;
                    border:1px solid #e5e7eb;
                    background:#fafafa;
                    margin-bottom:8px;
                    page-break-inside:avoid;
                  ">

                    <tr>

                      <td style="
                        width:42px;
                        padding:10px;
                      ">

                        <div style="
                          width:27px;
                          height:27px;
                          display:flex;
                          align-items:center;
                          justify-content:center;
                          background:#eef2ff;
                          color:#4338ca;
                          font-size:9px;
                          font-weight:700;
                        ">
                          ${String(index + 1).padStart(2, "0")}
                        </div>

                      </td>


                      <td style="
                        padding:10px 10px 10px 0;
                      ">

                        <div style="
                          font-size:11px;
                          font-weight:650;
                          color:#111827;
                        ">
                          ${safe(file.name)}
                        </div>

                        <div style="
                          margin-top:3px;
                          font-size:9px;
                          color:#6b7280;
                        ">
                          ${safe(
                            file.documentType ||
                            "Processed document"
                          )}
                        </div>

                      </td>

                    </tr>

                  </table>

                `
              )
              .join("")
          : `
            <div style="
              font-size:11px;
              color:#6b7280;
            ">
              No source documents were recorded.
            </div>
          `
      }


      <!-- =================================================
           08 OVERALL ASSESSMENT
      ================================================== -->

      ${sectionTitle(
        "08",
        "Overall Assessment",
        "Professional interpretation of the available evidence"
      )}


      <div style="
        border:1px solid #c7d2fe;
        background:#eef2ff;
        padding:20px;
        page-break-inside:avoid;
      ">

        <div style="
          font-size:9px;
          font-weight:700;
          color:#6366f1;
          text-transform:uppercase;
          letter-spacing:1px;
        ">
          Assessment
        </div>


        <div style="
          margin-top:10px;
          font-size:12px;
          line-height:1.85;
          color:#374151;
        ">
          ${safe(
            analysis?.overallAssessment ||
            "No overall assessment was provided."
          )}
        </div>

      </div>


      <!-- =================================================
           09 CONFIDENCE
      ================================================== -->

      ${sectionTitle(
        "09",
        "Analysis Confidence",
        "Confidence in the completeness and consistency of the document analysis"
      )}


      <div style="
        border:1px solid #d1d5db;
        background:#fafafa;
        padding:24px;
        text-align:center;
        page-break-inside:avoid;
      ">

        <div style="
          font-size:9px;
          color:#6b7280;
          text-transform:uppercase;
          letter-spacing:1px;
        ">
          Analysis Confidence
        </div>


        <div style="
          margin-top:9px;
          font-size:46px;
          line-height:1;
          font-weight:800;
          color:${confidenceColor};
        ">
          ${confidence}%
        </div>


        <table style="
          width:100%;
          border-collapse:collapse;
          margin-top:17px;
        ">

          <tr>

            <td style="
              height:9px;
              background:#e5e7eb;
              padding:0;
            ">

              <div style="
                width:${confidence}%;
                height:9px;
                background:${confidenceColor};
              "></div>

            </td>

          </tr>

        </table>


        <div style="
          margin-top:10px;
          font-size:9px;
          color:#6b7280;
        ">
          Reflects confidence in the document analysis,
          not legal or professional tax compliance.
        </div>

      </div>


      <!-- =================================================
           DISCLAIMER
      ================================================== -->

      <div style="
        margin-top:22px;
        padding:13px 15px;
        border:1px solid #e5e7eb;
        background:#fafafa;
        font-size:9px;
        line-height:1.65;
        color:#6b7280;
      ">

        <strong style="
          color:#374151;
        ">
          Important:
        </strong>

        This report summarizes information extracted from the
        submitted documents and calculations performed by
        Document Analyzer. It is not a substitute for advice
        from a qualified tax professional or tax authority.

      </div>


      <!-- =================================================
           FOOTER
      ================================================== -->

      <table style="
        width:100%;
        border-collapse:collapse;
        margin-top:32px;
        border-top:1px solid #d1d5db;
      ">

        <tr>

          <td style="
            padding-top:11px;
            font-size:8px;
            color:#9ca3af;
          ">
            Document Analyzer • Tax Assessment Report
          </td>


          <td style="
            padding-top:11px;
            text-align:right;
            font-size:8px;
            color:#9ca3af;
          ">
            AI-Assisted Financial Evidence Analysis
          </td>

        </tr>

      </table>

    </div>

  `;


  /*
   * =========================================================
   * SEND TO PDF SERVER
   * =========================================================
   */

  document.body.appendChild(
    pdfElement
  );


  try {

    if (
      document.fonts &&
      document.fonts.ready
    ) {

      await document.fonts.ready;

    }


    await new Promise((resolve) =>
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      })
    );


    console.log(
      "🔥 PROFESSIONAL TAX PDF HTML READY"
    );


    const response =
      await fetch(
        `${API_URL}/api/generate-pdf`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            html:
              pdfElement.innerHTML
          })

        }
      );


    if (!response.ok) {

      const errorText =
        await response.text();

      throw new Error(
        `PDF server error: ${response.status} ${errorText}`
      );

    }


    const pdfBlob =
      await response.blob();


    console.log(
      "🔥 PROFESSIONAL TAX PDF RECEIVED:",
      pdfBlob.size,
      "bytes"
    );


    const url =
      URL.createObjectURL(
        pdfBlob
      );


    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      "AI-Tax-Assessment-Report.pdf";


    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );


    console.log(
      "🔥 PROFESSIONAL TAX PDF DOWNLOAD COMPLETE"
    );


  } catch (error) {

    console.error(
      "❌ Professional Tax PDF generation failed:",
      error
    );

    alert(
      "Failed to generate Tax Assessment PDF."
    );

  } finally {

    if (
      document.body.contains(
        pdfElement
      )
    ) {

      document.body.removeChild(
        pdfElement
      );

    }

  }

};


  return (

    <div className="tax-assessment-report">

      {/* HEADER */}

      <div className="tax-report-header">

        <div>

          <span className="tax-report-eyebrow">
             TAX ASSESSMENT
          </span>

          <h1>
            {assessment?.taxpayer?.name ||
              "Tax Assessment"}
          </h1>

          <p>
            Tax Year{" "}
            {assessment?.taxpayer?.taxYear ||
              "Not established"}
          </p>

        </div>


        <div className="tax-report-header-actions">

          <div className="tax-report-badge">
            {confidence}% Confidence
          </div>


          <button
            type="button"
            className="tax-pdf-button"
            onClick={downloadTaxPDF}
          >
             Download PDF
          </button>

        </div>

      </div>


      {/* FINANCIAL OVERVIEW */}

      <section className="tax-report-card">

        <div className="tax-report-card-heading">

          <span>
            01
          </span>

          <h2>
             Financial Overview
          </h2>

        </div>


        <div className="tax-metrics-grid">

          <Metric
            label="Annual Gross Income"
            value={formatCurrency(
              assessment?.totals?.grossIncome
            )}
          />

          <Metric
            label="Annual Tax Withheld"
            value={formatCurrency(
              assessment?.totals?.taxWithheld
            )}
          />

          <Metric
            label="Annual Allowances"
            value={formatCurrency(
              salaryRecord?.allowances?.annualized
            )}
          />

          <Metric
            label="Annual Deductions"
            value={formatCurrency(
              salaryRecord?.deductions?.annualized
            )}
          />

        </div>

      </section>


      {/* ATTENTION */}

      <section
        className={`tax-report-card ${
          inconsistencies.length > 0
            ? "tax-attention-card"
            : "tax-success-card"
        }`}
      >

        <div className="tax-report-card-heading">

          <span>
            02
          </span>

          <h2>
             Attention Required
          </h2>

        </div>


        {inconsistencies.length > 0 ? (

          <div className="tax-inconsistency-list">

            {inconsistencies.map(
              (item, index) => (

                <div
                  key={index}
                  className="tax-inconsistency"
                >

                  <div className="tax-inconsistency-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>


                  <div className="tax-inconsistency-content">

                    <h3>
                      {formatTitle(
                        item.type
                      )}
                    </h3>


                    {item.type ===
                      "Salary Calculation Mismatch" ? (

                      <div className="tax-comparison-grid">

                        <ComparisonValue
                          label="Reported Net"
                          value={
                            formatCurrency(
                              item.reportedNetSalary
                            )
                          }
                        />

                        <ComparisonValue
                          label="Calculated Net"
                          value={
                            formatCurrency(
                              item.calculatedNetSalary
                            )
                          }
                        />

                        <ComparisonValue
                          label="Difference"
                          value={
                            formatCurrency(
                              item.difference
                            )
                          }
                          danger
                        />

                      </div>

                    ) : null}


                    <p>
                      {item.explanation}
                    </p>

                  </div>

                </div>

              )
            )}

          </div>

        ) : (

          <div className="tax-success-message">
            ✓ No deterministic inconsistencies were identified.
          </div>

        )}

      </section>


      {/* VERIFIED */}

      <section className="tax-report-card">

        <div className="tax-report-card-heading">

          <span>
            03
          </span>

          <h2>
             Verified Evidence
          </h2>

        </div>


        {confirmedItems.length > 0 ? (

          <div className="tax-confirmed-list">

            {confirmedItems.map(
              (item, index) => (

                <div
                  className="tax-confirmed-item"
                  key={index}
                >

                  <div className="tax-check">
                    ✓
                  </div>

                  <p>
                    {item}
                  </p>

                </div>

              )
            )}

          </div>

        ) : (

          <p className="tax-muted">
            No independently confirmed items were identified.
          </p>

        )}

      </section>


      {/* TAX */}

      <section className="tax-report-card">

        <div className="tax-report-card-heading">

          <span>
            04
          </span>

          <h2>
             Tax Overview
          </h2>

        </div>

        {renderAnalysisList(
          analysis.taxOverview,
          "No tax overview information was available."
        )}

      </section>


      {/* INCOME */}

      <section className="tax-report-card">

        <div className="tax-report-card-heading">

          <span>
            05
          </span>

          <h2>
             Income Sources
          </h2>

        </div>

        {renderAnalysisList(
          analysis.incomeSources,
          "No supported income sources were identified."
        )}

      </section>


      {/* MISSING */}

      <section className="tax-report-card">

        <div className="tax-report-card-heading">

          <span>
            06
          </span>

          <h2>
             Information Needed
          </h2>

        </div>

        {renderAnalysisList(
          missingInformation,
          "No important missing information was identified.",
          true
        )}

      </section>


      {/* DOCUMENTS */}

      <section className="tax-report-card">

        <div className="tax-report-card-heading">

          <span>
            07
          </span>

          <h2>
             Documents Reviewed
          </h2>

        </div>


        <div className="tax-reviewed-list">

          {files.map(
            (file, index) => (

              <div
                className="tax-reviewed-item"
                key={`${file.name}-${index}`}
              >

                <div className="tax-reviewed-number">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div>

                  <strong>
                    {file.name}
                  </strong>

                  <span>
                    {file.documentType ||
                      "Processed document"}
                  </span>

                </div>

              </div>

            )
          )}

        </div>

      </section>


      {/* OVERALL */}

      <section
        className="
          tax-report-card
          tax-overall-card
        "
      >

        <div className="tax-report-card-heading">

          <span>
            08
          </span>

          <h2>
             Overall Assessment
          </h2>

        </div>

        <p>
          {analysis.overallAssessment ||
            "No overall assessment was provided."}
        </p>

      </section>


      {/* CONFIDENCE */}

      <section className="tax-report-card tax-confidence-card">

        <div className="tax-report-card-heading">

          <span>
            09
          </span>

          <h2>
             Confidence
          </h2>

        </div>


        <div className="tax-confidence-number">
          {confidence}%
        </div>


        <div className="tax-confidence-bar">

          <div
            style={{
              width: `${confidence}%`
            }}
          />

        </div>

      </section>


    </div>

  );

}


/* =========================================================
   SMALL COMPONENTS
   ========================================================= */

function Metric({
  label,
  value
}) {

  return (

    <div className="tax-metric">

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>

  );

}


function ComparisonValue({
  label,
  value,
  danger = false
}) {

  return (

    <div
      className={`tax-comparison-value ${
        danger
          ? "tax-comparison-danger"
          : ""
      }`}
    >

      <span>
        {label}
      </span>

      <strong>
        {value}
      </strong>

    </div>

  );

}


/* =========================================================
   HELPERS
   ========================================================= */

function renderAnalysisList(
  items,
  emptyText,
  warning = false
) {

  if (
    !Array.isArray(items) ||
    items.length === 0
  ) {

    return (
      <p className="tax-muted">
        {emptyText}
      </p>
    );

  }


  return (

    <div
      className={`tax-report-list ${
        warning
          ? "tax-report-list-warning"
          : ""
      }`}
    >

      {items.map(
        (item, index) => (

          <div
            className="tax-report-list-item"
            key={index}
          >

            <span>
              {warning ? "!" : "•"}
            </span>

            <p>
              {item}
            </p>

          </div>

        )
      )}

    </div>

  );

}


function formatTitle(value) {

  if (!value) {
    return "Finding";
  }

  return value
    .replace(
      /([A-Z])/g,
      " $1"
    )
    .replace(
      /^./,
      (char) =>
        char.toUpperCase()
    );

}


export default TaxAssessmentReport;