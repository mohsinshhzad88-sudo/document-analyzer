const taxSchemas = require("./taxSchemas");

async function analyzeTaxDocuments(documents, groq) {

  if (!documents || documents.length === 0) {
    throw new Error("No tax documents available for analysis");
  }

  console.log(
    `🧠 Analyzing ${documents.length} tax document(s)...`
  );

  /*
   * Only send the extracted information to the AI.
   * The original document text is NOT analyzed again here.
   */

  const extractedInformation = documents.map((document) => ({
    fileName: document.fileName,
    documentType: document.documentType,
    data: document.data
  }));
      
  
  console.log(
  "🧪 DATA SENT TO TAX ANALYSIS AI:",
  JSON.stringify(extractedInformation, null, 2)
);


  const response =
    await groq.chat.completions.create({

      model: "openai/gpt-oss-120b",

      temperature: 0,

      response_format: {
        type: "json_object"
      },

      messages: [

        {
          role: "system",

          content: `
You are a tax-document analysis assistant.

Your job is to analyze ONLY the extracted information from the
provided tax documents.

IMPORTANT RULES:

1. Base the analysis ONLY on the provided document data.

2. NEVER invent financial information.

3. NEVER invent missing values.

4. Do not provide legal or professional tax advice.

5. Do not assume that documents belong to the same person unless
the information supports that conclusion.

6. Identify inconsistencies between documents when they exist.

7. Clearly distinguish:
   - Facts found in documents
   - Potential inconsistencies
   - Missing information

8. Do not treat missing information as zero.

9. Do not perform unsupported tax calculations.

10. If a calculation can be directly verified from provided values,
it may be mentioned, but clearly identify it as a calculation.

11. If the available information is insufficient for a reliable
conclusion, explicitly say so.

Return ONLY valid JSON.

Use exactly this structure:

{
  "summary": "",
  "financialOverview": [],
  "taxOverview": [],
  "incomeSources": [],
  "consistencyChecks": [],
  "missingInformation": [],
  "potentialIssues": [],
  "documentSummary": [],
  "overallAssessment": "",
  "confidence": 0
}

FIELD RULES:

summary:
- Give a concise overall summary of what the uploaded documents
  show.
- Do not invent information.

financialOverview:
- Important financial facts found across the documents.

taxOverview:
- Tax-related facts such as taxable income, tax assessed,
  tax paid, tax withheld, refund, or tax due when available.

incomeSources:
- Identify income sources supported by the documents.
- Do not invent income sources.

consistencyChecks:
- Compare related information between documents.
- Mention whether information appears consistent, inconsistent,
  or cannot be verified.
- Do not invent discrepancies.

missingInformation:
- List important tax or financial information that is not available.

potentialIssues:
- List potential issues supported by the documents.
- Do not call something an issue simply because information is missing.
- Do not provide legal conclusions.

documentSummary:
- Provide one short summary for each uploaded document.
- Include the filename and important information found.

overallAssessment:
- Give a professional overall assessment based only on the
  available documents.
- If the evidence is insufficient, clearly state that.

confidence:
- Integer from 0 to 100.
- Reflect confidence in the overall analysis based on the
  completeness and consistency of the provided documents.

All array items must be simple strings unless otherwise required.
`
        },

        {
          role: "user",

          content: `
Analyze the following extracted tax-document information.

DOCUMENTS:

${JSON.stringify(extractedInformation, null, 2)}
`
        }

      ]

    });

  let resultText =
    response.choices[0].message.content;

  resultText = resultText
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  const result =
    JSON.parse(resultText);

  console.log(
    "✅ Tax document analysis completed"
  );

  return result;
}

module.exports = analyzeTaxDocuments;

