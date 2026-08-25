const classifyTaxDocuments = require("./taxClassifier");
const extractTaxDocument = require("./taxExtractor");

async function processTaxDocuments(files, groq) {

  if (!files || files.length === 0) {
    throw new Error("No documents uploaded");
  }

  console.log(
    `🧾 Processing ${files.length} tax document(s)...`
  );

  // ============================================
  // STEP 1: CLASSIFY ALL DOCUMENTS
  // ============================================

  const classifiedDocuments =
    await classifyTaxDocuments(files, groq);

  // ============================================
  // STEP 2: EXTRACT INFORMATION
  // ============================================

  const processedDocuments = [];

  for (let i = 0; i < files.length; i++) {

    const file = files[i];

    const classification =
      classifiedDocuments[i];

    try {

      console.log(
        "🔎 Processing:",
        file.originalname
      );

      const extracted =
        await extractTaxDocument(
          file,
          groq,
          classification.documentType
        );
           
        console.log(
  "🧪 EXTRACTED TAX DATA:",
  JSON.stringify(extracted, null, 2)
);

      processedDocuments.push({

        fileName: file.originalname,

        documentType:
          classification.documentType,

        confidence:
          classification.confidence,

        data:
          extracted.data

      });

      console.log(
        "✓ Processing complete:",
        file.originalname
      );

    } catch (error) {

      console.error(
        "❌ Tax extraction failed:",
        file.originalname
      );

      console.error(error);

      processedDocuments.push({

        fileName: file.originalname,

        documentType:
          classification.documentType,

        confidence:
          classification.confidence,

        data: null,

        extractionError:
          "Unable to extract information from document"

      });

    }

  }

  console.log(
    `✅ Tax processing complete: ${processedDocuments.length} document(s)`
  );

  return processedDocuments;
}

module.exports = processTaxDocuments;

