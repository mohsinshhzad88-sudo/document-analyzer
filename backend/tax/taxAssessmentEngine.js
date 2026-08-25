
function taxAssessmentEngine(documents) {

  if (!documents || documents.length === 0) {
    throw new Error("No processed tax documents available");
  }

  /*
   * ============================================
   * HELPER FUNCTIONS
   * ============================================
   */

  function parseAmount(value) {

    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "number") {
      return value;
    }

    if (typeof value !== "string") {
      return null;
    }

    const cleaned = value
      .replace(/,/g, "")
      .replace(/[^\d.-]/g, "");

    if (!cleaned) {
      return null;
    }

    const number = Number(cleaned);

    return Number.isFinite(number) ? number : null;
  }


  function getFrequency(value) {

    if (!value || typeof value !== "string") {
      return "unknown";
    }

    const text = value.toLowerCase();

    if (
      text.includes("/month") ||
      text.includes("monthly") ||
      text.includes("per month")
    ) {
      return "monthly";
    }

    if (
      text.includes("/year") ||
      text.includes("yearly") ||
      text.includes("annual") ||
      text.includes("per year")
    ) {
      return "annual";
    }

    if (
      text.includes("/week") ||
      text.includes("weekly") ||
      text.includes("per week")
    ) {
      return "weekly";
    }

    if (
      text.includes("/day") ||
      text.includes("daily") ||
      text.includes("per day")
    ) {
      return "daily";
    }

    return "unknown";
  }


  function annualize(value, frequency) {

    if (value === null) {
      return null;
    }

    if (frequency === "monthly") {
      return value * 12;
    }

    if (frequency === "weekly") {
      return value * 52;
    }

    if (frequency === "daily") {
      return value * 365;
    }

    if (frequency === "annual") {
      return value;
    }

    return null;
  }


  function createAmountObject(value) {

    const amount = parseAmount(value);
    const frequency = getFrequency(value);

    return {
      original: value,
      amount,
      frequency,
      annualized: annualize(amount, frequency)
    };
  }


  /*
   * ============================================
   * ASSESSMENT OBJECT
   * ============================================
   */

  const assessment = {

    taxpayer: {
      name: null,
      taxYear: null
    },

    income: {
      employment: [],
      business: [],
      property: [],
      other: []
    },

    totals: {
      grossIncome: 0,
      taxableIncome: null,
      taxWithheld: 0,
      taxPaid: null,
      taxAssessed: null,
      taxDue: null,
      taxRefund: null
    },

    deductions: [],

    financialEvidence: [],

    missingInformation: [],

    inconsistencies: [],

    sourceDocuments: []

  };


  /*
   * ============================================
   * PROCESS DOCUMENTS
   * ============================================
   */

  for (const document of documents) {

    if (!document || !document.data) {
      continue;
    }

    const type = document.documentType;
    const data = document.data;


    /*
     * ============================================
     * SOURCE DOCUMENT
     * ============================================
     */

    assessment.sourceDocuments.push({

      fileName:
        document.fileName || "Unknown",

      documentType:
        type || "Other"

    });


    /*
     * ============================================
     * TAXPAYER NAME
     * ============================================
     */

    const possibleNames = [

      data.employeeName,
      data.accountHolder,
      data.recipientName,
      data.taxpayerName,
      data.ownerName

    ];

    for (const name of possibleNames) {

      if (
        name &&
        !assessment.taxpayer.name
      ) {

        assessment.taxpayer.name = name;

        break;

      }

    }


    /*
     * ============================================
     * TAX YEAR
     * ============================================
     */

    if (
      data.taxYear &&
      !assessment.taxpayer.taxYear
    ) {

      assessment.taxpayer.taxYear =
        data.taxYear;

    }


    /*
     * ============================================
     * SALARY RECORD
     * ============================================
     */

    if (type === "Salary Record") {

      const gross =
        createAmountObject(data.grossSalary);

      const allowances =
        createAmountObject(data.allowances);

      const bonuses =
        createAmountObject(data.bonuses);

      const deductions =
        createAmountObject(data.deductions);

      const taxWithheld =
        createAmountObject(data.taxWithheld);

      const netSalary =
        createAmountObject(data.netSalary);


      assessment.income.employment.push({

        source: "Salary Record",

        employerName:
          data.employerName || null,

        grossSalary: gross,

        allowances,

        bonuses,

        deductions,

        taxWithheld,

        netSalary,

        currency:
          data.currency || null

      });


      /*
       * ============================================
       * ANNUAL GROSS INCOME
       * ============================================
       *
       * Only annualize when the source explicitly
       * indicates a recurring frequency.
       */

      if (gross.annualized !== null) {

        assessment.totals.grossIncome +=
          gross.annualized;

      }


      /*
       * ============================================
       * ANNUAL TAX WITHHELD
       * ============================================
       */

      if (taxWithheld.annualized !== null) {

        assessment.totals.taxWithheld +=
          taxWithheld.annualized;

      }


      /*
       * ============================================
       * DEDUCTION EVIDENCE
       * ============================================
       */

      if (deductions.amount !== null) {

        assessment.deductions.push({

          source: "Salary Record",

          type: "Salary deductions",

          amount: deductions.amount,

          frequency:
            deductions.frequency,

          annualized:
            deductions.annualized,

          currency:
            data.currency || null

        });

      }

    }


    /*
     * ============================================
     * BANK STATEMENT
     * ============================================
     */

    if (type === "Bank Statement") {

      assessment.financialEvidence.push({

        type: "Bank Statement",

        fileName:
          document.fileName || null,

        statementPeriod:
          data.statementPeriod || null,

        totalDeposits:
          data.totalDeposits || null,

        totalWithdrawals:
          data.totalWithdrawals || null,

        salaryCredits:
          data.salaryCredits || null,

        otherIncome:
          data.otherIncome || null,

        currency:
          data.currency || null

      });


      /*
       * ============================================
       * SALARY CREDITS
       * ============================================
       */

      if (
        Array.isArray(data.salaryCredits)
      ) {

        for (
          const salary of data.salaryCredits
        ) {

          assessment.income.employment.push({

            source: "Bank Statement",

            amount:
              salary.amount || null,

            date:
              salary.date || null,

            description:
              salary.description || null

          });

        }

      }


      /*
       * Some extractors may return salaryCredits
       * as a single string instead of an array.
       */

      else if (
        data.salaryCredits
      ) {

        assessment.income.employment.push({

          source: "Bank Statement",

          amount:
            data.salaryCredits,

          date: null,

          description:
            "Salary credit reported in bank statement"

        });

      }


      /*
       * ============================================
       * OTHER INCOME
       * ============================================
       */

      if (
        Array.isArray(data.otherIncome)
      ) {

        for (
          const income of data.otherIncome
        ) {

          assessment.income.other.push({

            source: "Bank Statement",

            amount:
              income.amount || null,

            date:
              income.date || null,

            description:
              income.description || null

          });

        }

      }

      else if (
        data.otherIncome
      ) {

        assessment.income.other.push({

          source: "Bank Statement",

          amount:
            data.otherIncome,

          date: null,

          description:
            "Other income reported in bank statement"

        });

      }

    }


    /*
     * ============================================
     * WITHHOLDING RECORD
     * ============================================
     */

    if (type === "Withholding Record") {

      const taxWithheld =
        createAmountObject(data.taxWithheld);


      assessment.financialEvidence.push({

        type: "Withholding Record",

        fileName:
          document.fileName || null,

        payerName:
          data.payerName || null,

        incomeType:
          data.incomeType || null,

        grossAmount:
          data.grossAmount || null,

        taxWithheld:
          data.taxWithheld || null,

        currency:
          data.currency || null

      });


      if (
        taxWithheld.annualized !== null
      ) {

        assessment.totals.taxWithheld +=
          taxWithheld.annualized;

      }

    }


    /*
     * ============================================
     * BUSINESS RECORD
     * ============================================
     */

    if (type === "Business Record") {

      const revenue =
        createAmountObject(data.revenue);

      const expenses =
        createAmountObject(data.expenses);

      const businessIncome =
        createAmountObject(data.businessIncome);


      assessment.income.business.push({

        businessName:
          data.businessName || null,

        revenue,

        expenses,

        businessIncome,

        taxPaid:
          data.taxPaid || null,

        taxWithheld:
          data.taxWithheld || null,

        currency:
          data.currency || null

      });


      /*
       * Business income contributes to gross
       * income only when an explicit annual value
       * or recurring frequency is available.
       */

      if (
        businessIncome.annualized !== null
      ) {

        assessment.totals.grossIncome +=
          businessIncome.annualized;

      }

    }


    /*
     * ============================================
     * PROPERTY RECORD
     * ============================================
     */

    if (type === "Property Record") {

      const rentalIncome =
        createAmountObject(data.rentalIncome);


      assessment.income.property.push({

        propertyType:
          data.propertyType || null,

        propertyValue:
          data.propertyValue || null,

        rentalIncome,

        expenses:
          data.expenses || null,

        taxPaid:
          data.taxPaid || null,

        taxWithheld:
          data.taxWithheld || null,

        currency:
          data.currency || null

      });


      if (
        rentalIncome.annualized !== null
      ) {

        assessment.totals.grossIncome +=
          rentalIncome.annualized;

      }

    }


    /*
     * ============================================
     * TAX DOCUMENT
     *
     * Optional.
     *
     * If the user already has a tax document,
     * we use it as evidence.
     *
     * The system does NOT require it.
     * ============================================
     */

    if (type === "Tax Document") {

      const taxableIncome =
        parseAmount(data.taxableIncome);

      const taxAssessed =
        parseAmount(data.taxAssessed);

      const taxPaid =
        parseAmount(data.taxPaid);

      const taxDue =
        parseAmount(data.taxDue);

      const taxRefund =
        parseAmount(data.taxRefund);


      if (
        taxableIncome !== null
      ) {

        assessment.totals.taxableIncome =
          taxableIncome;

      }


      if (
        taxAssessed !== null
      ) {

        assessment.totals.taxAssessed =
          taxAssessed;

      }


      if (
        taxPaid !== null
      ) {

        assessment.totals.taxPaid =
          taxPaid;

      }


      if (
        taxDue !== null
      ) {

        assessment.totals.taxDue =
          taxDue;

      }


      if (
        taxRefund !== null
      ) {

        assessment.totals.taxRefund =
          taxRefund;

      }

    }

  }

    /*
   * ============================================
   * CONSISTENCY CHECKS
   * ============================================
   */

  /*
   * ============================================
   * SALARY RECORD MATHEMATICS
   * ============================================
   */

  for (const employment of assessment.income.employment) {

    if (
      employment.source !== "Salary Record"
    ) {
      continue;
    }

    const gross =
      employment.grossSalary?.amount ?? null;

    const allowances =
      employment.allowances?.amount ?? 0;

    const bonuses =
      employment.bonuses?.amount ?? 0;

    const deductions =
      employment.deductions?.amount ?? 0;

    const taxWithheld =
      employment.taxWithheld?.amount ?? 0;

    const netSalary =
      employment.netSalary?.amount ?? null;


    /*
     * Only perform the calculation when
     * the required numeric values exist.
     */

    if (
      gross !== null &&
      netSalary !== null
    ) {

      const calculatedNet =
        gross +
        allowances +
        bonuses -
        deductions -
        taxWithheld;


      const difference =
        Math.abs(calculatedNet - netSalary);


      /*
       * Allow a very small rounding difference.
       */

      if (difference > 1) {

        assessment.inconsistencies.push({

          type: "Salary Calculation Mismatch",

          source: "Salary Record",

          employer:
            employment.employerName || null,

          reportedNetSalary:
            netSalary,

          calculatedNetSalary:
            calculatedNet,

          difference,

          explanation:
            "Gross salary plus allowances and bonuses, minus deductions and tax withheld, does not equal the reported net salary."

        });

      }

    }

  }


  /*
   * ============================================
   * BANK SALARY VS SALARY RECORD
   * ============================================
   */

  const bankSalaryAmounts = [];

  for (
    const employment of assessment.income.employment
  ) {

    if (
      employment.source === "Bank Statement"
    ) {

      const amount =
        parseAmount(employment.amount);

      if (amount !== null) {

        bankSalaryAmounts.push(amount);

      }

    }

  }


  const salaryRecordNetAmounts = [];

  for (
    const employment of assessment.income.employment
  ) {

    if (
      employment.source === "Salary Record" &&
      employment.netSalary?.amount !== null &&
      employment.netSalary?.frequency === "monthly"
    ) {

      salaryRecordNetAmounts.push(
        employment.netSalary.amount
      );

    }

  }


  if (
    bankSalaryAmounts.length > 0 &&
    salaryRecordNetAmounts.length > 0
  ) {

    for (
      const bankAmount of bankSalaryAmounts
    ) {

      for (
        const salaryAmount of salaryRecordNetAmounts
      ) {

        if (
          Math.abs(bankAmount - salaryAmount) > 1
        ) {

          assessment.inconsistencies.push({

            type: "Bank Salary Mismatch",

            bankSalary:
              bankAmount,

            salaryRecordNetSalary:
              salaryAmount,

            difference:
              Math.abs(
                bankAmount -
                salaryAmount
              ),

            explanation:
              "Salary credited to the bank account does not match the net salary reported in the salary record."

          });

        }

      }

    }

  }


  /*
   * ============================================
   * TAX YEAR VALIDATION
   * ============================================
   *
   * Pakistan normal tax year:
   *
   * July 1 → June 30
   *
   * The tax year is named after the
   * calendar year in which June 30 falls.
   *
   * Example:
   *
   * July 1 2026 → June 30 2027
   * = Tax Year 2027
   *
   * ============================================
   */

  function getPakistanTaxYearFromDate(date) {

    if (!date) {
      return null;
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(parsed.getTime())
    ) {
      return null;
    }

    const month =
      parsed.getMonth() + 1;

    const year =
      parsed.getFullYear();


    /*
     * January through June
     */

    if (month <= 6) {
      return year;
    }


    /*
     * July through December
     */

    return year + 1;

  }


  /*
   * Extract a likely date from a statement
   * period such as:
   *
   * 1 July 2026 – 31 July 2026
   */

  function extractStatementYear(period) {

    if (
      !period ||
      typeof period !== "string"
    ) {

      return null;

    }


    const match =
      period.match(
        /\b(20\d{2})\b/
      );


    if (!match) {
      return null;
    }


    const year =
      Number(match[1]);


    /*
     * If the statement contains July–December,
     * the Pakistani tax year is the following year.
     *
     * For our current extractor we can safely
     * detect July–December from the text.
     */

    const lower =
      period.toLowerCase();


    const secondHalf =
      lower.includes("july") ||
      lower.includes("august") ||
      lower.includes("september") ||
      lower.includes("october") ||
      lower.includes("november") ||
      lower.includes("december");


    if (secondHalf) {
      return year + 1;
    }


    return year;

  }


  /*
   * Compare bank statement tax year
   * against the taxpayer tax year.
   */

  for (
    const evidence of assessment.financialEvidence
  ) {

    if (
      evidence.type !== "Bank Statement"
    ) {
      continue;
    }


    const inferredTaxYear =
      extractStatementYear(
        evidence.statementPeriod
      );


    if (
      inferredTaxYear !== null &&
      assessment.taxpayer.taxYear !== null
    ) {

      const declaredTaxYear =
        Number(
          assessment.taxpayer.taxYear
        );


      if (
        inferredTaxYear !== declaredTaxYear
      ) {

        assessment.inconsistencies.push({

          type: "Tax Year Mismatch",

          source:
            evidence.fileName,

          declaredTaxYear,

          inferredTaxYear,

          statementPeriod:
            evidence.statementPeriod,

          explanation:
            `The bank statement period appears to belong to Tax Year ${inferredTaxYear}, but the available tax document reports Tax Year ${declaredTaxYear}.`

        });

      }

    }

  }


  /*
   * ============================================
   * TAXPAYER NAME CONSISTENCY
   * ============================================
   */

  const taxpayerNames = new Set();


  for (const document of documents) {

    if (
      !document ||
      !document.data
    ) {
      continue;
    }


    const data =
      document.data;


    const names = [

      data.employeeName,
      data.accountHolder,
      data.recipientName,
      data.taxpayerName,
      data.ownerName

    ];


    for (const name of names) {

      if (
        name &&
        typeof name === "string"
      ) {

        taxpayerNames.add(
          name.trim()
        );

      }

    }

  }


  if (
    taxpayerNames.size > 1
  ) {

    assessment.inconsistencies.push({

      type: "Taxpayer Name Conflict",

      names:
        [...taxpayerNames],

      explanation:
        "Different taxpayer names were found across the submitted documents."

    });

  }


  /*
   * ============================================
   * EMPLOYER CONSISTENCY
   * ============================================
   */

  const employers = new Set();


  for (
    const employment of assessment.income.employment
  ) {

    if (
      employment.source === "Salary Record" &&
      employment.employerName
    ) {

      employers.add(
        employment.employerName.trim()
      );

    }

  }


  if (
    employers.size > 1
  ) {

    assessment.inconsistencies.push({

      type: "Employer Conflict",

      employers:
        [...employers],

      explanation:
        "Multiple different employers were found in the submitted salary records."

    });

  }


  /*
   * ============================================
   * DUPLICATE SALARY RECORD DETECTION
   * ============================================
   */

  const salaryKeys = new Set();


  for (
    const employment of assessment.income.employment
  ) {

    if (
      employment.source !== "Salary Record"
    ) {
      continue;
    }


    const key = [

      employment.employerName || "",

      employment.grossSalary?.amount || "",

      employment.netSalary?.amount || "",

      employment.taxWithheld?.amount || ""

    ].join("|");


    if (
      salaryKeys.has(key)
    ) {

      assessment.inconsistencies.push({

        type: "Duplicate Salary Evidence",

        employer:
          employment.employerName || null,

        explanation:
          "Two or more salary records appear to contain the same financial information and may represent duplicate evidence."

      });

    }


    salaryKeys.add(key);

  }


  /*
   * ============================================
   * DUPLICATE WITHHOLDING DETECTION
   * ============================================
   */

  const withholdingSources = [];


  for (
    const employment of assessment.income.employment
  ) {

    if (
      employment.source === "Salary Record" &&
      employment.taxWithheld?.amount !== null
    ) {

      withholdingSources.push({

        source: "Salary Record",

        amount:
          employment.taxWithheld.amount

      });

    }

  }


  for (
    const evidence of assessment.financialEvidence
  ) {

    if (
      evidence.type === "Withholding Record"
    ) {

      const amount =
        parseAmount(
          evidence.taxWithheld
        );


      if (amount !== null) {

        withholdingSources.push({

          source: "Withholding Record",

          amount

        });

      }

    }

  }


  /*
   * If both salary records and withholding
   * certificates report withholding, don't
   * automatically add them together without
   * determining whether they represent the
   * same tax deduction.
   */

  if (
    withholdingSources.length > 1
  ) {

    assessment.inconsistencies.push({

      type: "Potential Duplicate Withholding",

      sources:
        withholdingSources,

      explanation:
        "Multiple documents report tax withholding. The amounts should be reconciled before treating them as separate tax payments."

    });

  }

  /*
   * ============================================
   * MISSING INFORMATION
   * ============================================
   */

  if (
    assessment.income.employment.length === 0
  ) {

    assessment.missingInformation.push(
      "No employment income information was found."
    );

  }


  if (
    assessment.income.business.length === 0
  ) {

    assessment.missingInformation.push(
      "No business income information was found."
    );

  }


  if (
    assessment.income.property.length === 0
  ) {

    assessment.missingInformation.push(
      "No property or rental income information was found."
    );

  }


  if (
    assessment.totals.taxWithheld === 0
  ) {

    assessment.missingInformation.push(
      "No tax withholding information was found."
    );

  }


  /*
   * IMPORTANT:
   *
   * We do NOT say taxable income is missing
   * merely because there is no Tax Return.
   *
   * At this stage taxable income simply has
   * not yet been calculated.
   */

  if (
    assessment.totals.taxableIncome === null
  ) {

    assessment.missingInformation.push(
      "Taxable income has not yet been calculated from the available income and deduction information."
    );

  }


  /*
   * ============================================
   * RETURN
   * ============================================
   */

  return assessment;

}


module.exports = taxAssessmentEngine;

