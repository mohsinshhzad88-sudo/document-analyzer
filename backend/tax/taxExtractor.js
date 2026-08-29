const pdfParse = require("pdf-parse");
const taxSchemas = require("./taxSchemas");


async function extractTaxDocument(file, groq, documentType) {

    console.log("🚨 NEW TAX EXTRACTOR LOADED"); 

  console.log(
    `🔎 Extracting tax information: ${file.originalname}`
  );

  const data = await pdfParse(file.buffer);

  const extractedText = data.text;

  if (!extractedText || !extractedText.trim()) {
    throw new Error(
      `No readable text found in ${file.originalname}`
    );
  }

  const schema =
    taxSchemas[documentType] || taxSchemas["Other"];

  /*
   * Keep the extraction prompt focused.
   *
   * The model is responsible only for extracting
   * information explicitly present in the document.
   */

  const systemPrompt = `
You are a financial and tax document extraction assistant.

DOCUMENT TYPE:
${documentType}

TASK:
Extract factual information from the document and return ONLY
a valid JSON object matching the provided schema.

STRICT RULES:

1. Extract ONLY information explicitly present in the document.
2. NEVER invent, estimate, calculate, or assume values.
3. Missing or unclear scalar fields must be null.
4. Missing arrays must be [].
5. Do not convert missing values to zero.
6. A value explicitly reported as zero MUST remain numeric 0.
7. Preserve monetary values accurately.
8. Preserve the currency exactly as shown.
9. Do not provide tax advice.
10. Do not calculate taxable income or tax liability.

TAX YEAR:

- Extract taxYear when explicitly stated.
- If a Pakistani tax period is explicitly shown as 1 July YYYY
  through 30 June YYYY, it may be represented as YYYY-YYYY+1.
- Do not infer a tax year from incomplete or ambiguous dates.

WITHHOLDING RECORD:

If the document type is "Withholding Record":

- taxpayerName is the person/entity from whom tax was collected.
- taxCollector is the person/company/bank/platform that collected it.
- Never swap these roles.
- taxWithheld is the actual tax collected/withheld.
- Explicit zero tax withheld must be returned as 0.
- grossAmount is the amount associated with the withholding transaction/base.
- grossAmount is NOT automatically income.

BANK STATEMENT:

If the document type is "Bank Statement":

- Extract every identifiable transaction.
- transactions must be an array.
- Do not create placeholder transactions.
- If there are no identifiable transactions, return [].
- Transaction type should be credit, debit, or authorization when determinable.
- amount must be numeric and contain no currency symbol.
- Preserve dates and descriptions.
- Preserve transactionMethod when explicitly shown.
- Preserve counterparty when explicitly shown.
- Preserve balanceAfterTransaction when explicitly shown.
- Preserve openingBalance and closingBalance when explicitly shown.
- Preserve statement-level totalDeposits and totalWithdrawals.
- salaryCredits must contain ONLY transactions explicitly identifiable
  as salary, wages, payroll, employer payment, or equivalent.
- otherIncome must contain ONLY transactions explicitly identified
  as income.
- Do NOT classify ordinary transfers as income.
- Do NOT classify every credit as income.
- Do NOT calculate income from transactions.

RETURN FORMAT:

Return exactly one JSON object using this schema:

${JSON.stringify(schema, null, 2)}

Return ONLY the JSON object.
Do not use markdown.
Do not wrap the JSON in json.
Do not add explanations.

The first character of your response must be {.
The last character of your response must be }.
`;

  let response;

  try {

    response = await groq.chat.completions.create({

      model: "openai/gpt-oss-120b",

      temperature: 0,

      
      messages: [

        {
          role: "system",
          content: systemPrompt
        },

        {
          role: "user",
          content: `DOCUMENT CONTENT:\n\n${extractedText}`
        }

      ]

    });

  } catch (error) {

    console.error(
      `❌ Groq extraction request failed: ${file.originalname}`
    );

    console.error(error);

    throw error;
  }

  let resultText =
    response?.choices?.[0]?.message?.content;

  console.log(
  "🧪 FULL GROQ RESPONSE:",
  JSON.stringify(response, null, 2)
);

console.log(
  "🧪 MESSAGE:",
  JSON.stringify(response.choices?.[0]?.message, null, 2)
);

console.log(
  "🧪 CONTENT:",
  JSON.stringify(response.choices?.[0]?.message?.content)
);

console.log(
  "🧪 REASONING:",
  JSON.stringify(response.choices?.[0]?.message?.reasoning)
);

console.log(
  "🧪 FINISH REASON:",
  response.choices?.[0]?.finish_reason
);

  if (!resultText) {

    throw new Error(
      `AI returned empty extraction result for ${file.originalname}`
    );

  }

  resultText = resultText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  let extractedData;

  try {

    extractedData =
      JSON.parse(resultText);

  } catch (error) {

    console.error(
      `❌ Invalid JSON returned by AI: ${file.originalname}`
    );

    console.error(resultText);

    throw new Error(
      `AI returned invalid JSON for ${file.originalname}`
    );

  }

  console.log(
    `✓ Tax information extracted: ${file.originalname}`
  );

  console.log(
    "📦 EXTRACTED DATA:",
    JSON.stringify(extractedData, null, 2)
  );

  return {

    fileName: file.originalname,

    documentType,

    data: extractedData

  };

}

module.exports = extractTaxDocument;