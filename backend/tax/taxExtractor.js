const pdfParse = require("pdf-parse");
const taxSchemas = require("./taxSchemas");

async function extractTaxDocument(file, groq, documentType) {

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
You are a tax document information extraction assistant.

Your job is to extract factual financial and tax information
from the provided document.

IMPORTANT RULES:

1. Extract ONLY information explicitly present in the document.

2. NEVER invent or estimate values.

3. If a field is not present or cannot be reliably determined,
return null.

4. Do not convert missing values into zero.

5. Preserve monetary amounts accurately.

6. Preserve the currency used by the document.

7. Do not perform tax calculations.

8. Do not give tax advice.

9. Do not make assumptions about the taxpayer.

10. Do not infer information that is not supported by the document.

The document has been classified as:

${documentType}

Return ONLY valid JSON.

Use exactly this structure:

${JSON.stringify(schema, null, 2)}

Return no markdown.
Return no explanation outside the JSON.
`
        },

        {
          role: "user",

          content: `
DOCUMENT:

${extractedText}
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

  const extractedData =
    JSON.parse(resultText);

  console.log(
    `✓ Tax information extracted: ${file.originalname}`
  );

  return {
    fileName: file.originalname,
    documentType,
    data: extractedData
  };
}

module.exports = extractTaxDocument;

