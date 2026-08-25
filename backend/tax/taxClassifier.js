
const pdfParse = require("pdf-parse");

const TAX_DOCUMENT_TYPES = [
  "Bank Statement",
  "Tax Document",
  "Salary Record",
  "Withholding Record",
  "Property Record",
  "Business Record",
  "Other Evidence"
];

async function classifyTaxDocuments(files, groq) {

  if (!files || files.length === 0) {
    throw new Error("No documents uploaded");
  }

  const classifiedDocuments = [];

  for (const file of files) {

    try {

      console.log("🧾 Classifying tax document:", file.originalname);

      const data = await pdfParse(file.buffer);

      const preview = data.text.substring(0, 4000);

      const response = await groq.chat.completions.create({

        model: "openai/gpt-oss-120b",

        temperature: 0,

        response_format: {
          type: "json_object"
        },

        messages: [

          {
            role: "system",

            content: `
You are a tax-document classification assistant.

Your job is ONLY to identify what type of tax-related document has been uploaded.

Classify the document into ONE category only.

Allowed categories:

- Bank Statement
- Tax Document
- Salary Record
- Withholding Record
- Property Record
- Business Record
- Other Evidence

Classification rules:

Bank Statement:
- Bank account statements
- Account transaction histories
- Bank-issued statements
- Deposits and withdrawals

Tax Document:
- Tax returns
- Tax notices
- Tax registration documents
- Tax assessment documents
- Tax authority documents

Salary Record:
- Salary slips
- Payslips
- Salary certificates
- Employment income records

Withholding Record:
- Withholding certificates
- Tax deducted at source records
- Withholding statements
- Tax deduction certificates

Property Record:
- Property ownership documents
- Property sale/purchase records
- Rental income records
- Property-related financial documents

Business Record:
- Business income records
- Business expense records
- Business ledgers
- Business financial statements
- Invoices related to business activity

Other Evidence:
- Documents relevant to tax analysis that do not clearly fit another category.

IMPORTANT:

- Do not invent information.
- Do not calculate tax.
- Do not extract detailed financial values yet.
- Only classify the document.
- Base the classification on the document content.
- If the document is unclear, use "Other Evidence".
- Return confidence from 0 to 100.

Return ONLY valid JSON.

{
  "documentType": "",
  "confidence": 0
}
`
          },

          {
            role: "user",

            content: `
DOCUMENT FILENAME:

${file.originalname}

DOCUMENT CONTENT:

${preview}
`
          }

        ]

      });

      let aiResult = response.choices[0].message.content;

      aiResult = aiResult
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const result = JSON.parse(aiResult);

      const documentType =
        TAX_DOCUMENT_TYPES.includes(result.documentType)
          ? result.documentType
          : "Other Evidence";

      const confidence =
        Number.isFinite(Number(result.confidence))
          ? Math.max(
              0,
              Math.min(100, Number(result.confidence))
            )
          : 0;

      classifiedDocuments.push({

        fileName: file.originalname,

        documentType,

        confidence

      });

      console.log(
        "✓ Tax document classified:",
        file.originalname,
        "→",
        documentType,
        `(${confidence}%)`
      );

    } catch (error) {

      console.error(
        "❌ Tax classification failed:",
        file.originalname
      );

      console.error(error);

      classifiedDocuments.push({

        fileName: file.originalname,

        documentType: "Other Evidence",

        confidence: 0,

        error: "Unable to classify document"

      });

    }

  }

  return classifiedDocuments;
}

module.exports = classifyTaxDocuments;

