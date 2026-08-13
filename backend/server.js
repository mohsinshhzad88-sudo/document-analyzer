require("dotenv").config();
const express = require("express");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const Groq = require("groq-sdk");
const path = require("path");

const chunkText = require("./utils/chunkText");
const getprompt = require("./prompts");
const getComparisonPrompt = require("./prompts/comparisonPrompts");
const referenceClassifierPrompt = require("./prompts/referenceClassifierPrompt");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://document-analyzer-351n.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {

    if (!origin) return callback(null, true);

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true);
    }

    callback(new Error("Not allowed by CORS"));
  }
}));


app.use(express.json({ limit: "20mb" }));

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// File storage setup
const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});


const upload = multer({ storage });


// Home route
app.get("/", (req, res) => {
  res.send("🚀 Welcome to Document Analyzer Backend!");
});


// Test API route
app.get("/api/message", (req, res) => {
  res.json({
    message: "Hello from Express! 🚀"
  });
});
app.post("/api/detect-type", upload.single("document"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const data = await pdfParse(req.file.buffer);
    const preview = data.text.substring(0, 3000);

    console.log("Detecting document type...");

   const analysisConfig = getprompt(
  req.body.documentType,
  req.body.documentLanguage
);

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
       temperature: 0,
       response_format: {
    type: "json_object"
  },
      messages: [
        {
          role: "system",
          content: `
You are an expert document classifier.

Confidence rules:
- Return confidence between 80-100 for clear readable documents.
- Use low confidence only when the document is unclear, empty, corrupted, or insufficient.

Classify the document into ONE category only.

Categories:

Academic:
- Research Paper
- Student Assignment
- Study Notes
- Essay / Article

Professional:
- Resume / CV
- Business Report
- Financial Report
- Legal Contract
- Technical Documentation

Creative:
- Story / Novel

Personal:
- Personal Note
- Biography
- Introduction

General:
- Meeting Minutes
- Other

Important:
Return only the document type name.
Do not return the group name (Academic, Professional, Creative, Personal, General).

Classification rules:
- If the document mainly describes a person's name, location, interests, thoughts, or personal introduction, choose "Personal Note".
- If the document contains education, skills, experience, or career information, choose "Resume / CV".
- Do not classify short personal introductions as Resume/CV.
- Do not invent document purpose from limited text.

Return ONLY valid JSON.

{
  "documentType": "",
  "documentTypeConfidence": 0
}
`
        },
        {
          role: "user",
          content: preview
        }
      ]
    });

    let aiResult = response.choices[0].message.content;

console.log("RAW TYPE RESPONSE:");
console.log(aiResult);

aiResult = aiResult.replace(/```json/g, "");
aiResult = aiResult.replace(/```/g, "");
aiResult = aiResult.trim();

const result = JSON.parse(aiResult);

    return res.json({
      success: true,
      documentType: result.documentType,
      documentTypeConfidence: result.documentTypeConfidence
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

});
   
      app.post("/api/detect-reference-type", upload.single("document"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const data = await pdfParse(req.file.buffer);
    const preview = data.text.substring(0, 3000);

    console.log("Detecting document type...");

   const analysisConfig = getprompt(
  req.body.documentType,
  req.body.documentLanguage
);

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
       temperature: 0,
       response_format: {
    type: "json_object"
  },
      messages: [
        {
          role: "system",
          content: referenceClassifierPrompt

        },
        {
          role: "user",
          content: preview
        }
      ]
    });

    let aiResult = response.choices[0].message.content;

console.log("RAW TYPE RESPONSE:");
console.log(aiResult);

aiResult = aiResult.replace(/```json/g, "");
aiResult = aiResult.replace(/```/g, "");
aiResult = aiResult.trim();

const result = JSON.parse(aiResult);

    return res.json({
      success: true,
      referenceType: result.referenceType,
      confidence: result.confidence
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

});
   
      
     app.post("/api/detect-language", upload.single("document"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const data = await pdfParse(req.file.buffer);
    const preview = data.text.substring(0, 3000);

    console.log("Detecting document language...");

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
You are an expert language detector.
Confidence rules:
- Return confidence between 80-100 for clearly readable documents.
- Use low confidence only if the language cannot be reliably determined.

Detect the primary language of the document.

Return ONLY valid JSON.

{
  "language": "",
  "languageConfidence": 0
}
`
        },
        {
          role: "user",
          content: preview
        }
      ]
    });

   let aiResult = response.choices[0].message.content;

console.log("RAW TYPE RESPONSE:");
console.log(aiResult);

aiResult = aiResult.replace(/```json/g, "");
aiResult = aiResult.replace(/```/g, "");
aiResult = aiResult.trim();

const result = JSON.parse(aiResult);

    return res.json({
      success: true,
      language: result.language,
      languageConfidence: result.languageConfidence
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

});
  
   app.post("/api/evaluate", upload.fields([
  { name: "reference", maxCount: 1 },
  { name: "document", maxCount: 1 }
]), async (req, res) => {

  try {

    const referenceFile = req.files.reference[0];

    const mainFile = req.files.document[0];

    const referenceData = await pdfParse(referenceFile.buffer);

      const mainData = await pdfParse(mainFile.buffer);


    const referenceText = referenceData.text;

    const mainText = mainData.text;

  const comparisonPrompt = getComparisonPrompt(
  req.body.referenceType
);

console.log("Reference Type:", req.body.referenceType);

console.log("========== REFERENCE TEXT ==========");
console.log(referenceText.substring(0, 500));

console.log("========== MAIN DOCUMENT TEXT ==========");
console.log(mainText.substring(0, 500));

console.log(
  "Reference:",
  referenceFile.originalname
);

console.log(
  "Main:",
  mainFile.originalname
);

const response = await groq.chat.completions.create({

  model: "llama-3.1-8b-instant",

  temperature: 0,

  response_format: {
    type: "json_object"
  },

  messages: [

    {
      role: "system",
      content: comparisonPrompt


    },

    {
      role:"user",
      content:`

REFERENCE DOCUMENT:

${referenceText}


MAIN DOCUMENT:

${mainText}

`
    }

  ]

});


const result = JSON.parse(
  response.choices[0].message.content
);


res.json({
  success:true,
  result
});

  } catch (error) {

    console.error("========== EVALUATE ERROR ==========");
    console.error(error);

    if (error.response) {
        console.error(error.response.data);
    }

    res.status(500).json({
        success: false,
        message: error.message
    });
}

});

app.post("/api/upload", upload.single("document"), async (req, res) => {

  

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }


    // 1. Read uploaded PDF
   const dataBuffer = req.file.buffer;

    // 2. Extract text
     const data = await pdfParse(dataBuffer);

     const extractedText = data.text;
    const chunks = chunkText(extractedText);


          console.log("=================================");
          console.log("Chunks created:", chunks.length);
          console.log("Document length:", extractedText.length);
          console.log("=================================");


    console.log("Text extracted:");
    console.log(extractedText.substring(0, 300));


   // 3. Send text to Groq
 


let partialReports = [];

for (const chunk of chunks) {

  console.log("Analyzing chunk...");

  const analysisConfig = getprompt(
  req.body.documentType,
  req.body.documentLanguage
);


  let response;

while (true) {
  try {

    response = await groq.chat.completions.create({

      model: "llama-3.1-8b-instant",
      
      temperature: 0,

      messages: [
{
  role: "system",
  content: `
You are a document auditing assistant.

IMPORTANT:
Your analysis will be used to create a final document quality report.

Follow these rules:
- Analyze only the provided document section.
- Do not suggest changing story events, characters, topics, examples, or subject content.
- Do not create fictional risks.
- Recommendations must only relate to:
  - writing quality
  - clarity
  - structure
  - formatting
  - completeness
  - consistency
- Evaluate quality, not the subject matter.

Return factual analysis only.
`
},
{
 role: "user",
 content: `
${analysisConfig.prompt}

Document section:

${chunk}
`
}
]

    });

    break;

  } catch (error) {

    if (error.status === 429) {
      console.log("Rate limit reached. Waiting 15 seconds...");
      await new Promise(resolve => setTimeout(resolve, 15000));
      continue;
    }

    throw error;
  }
}

partialReports.push(response.choices[0].message.content);
// wait before next chunk
await new Promise(resolve => setTimeout(resolve, 5000));

}
const combinedReport = partialReports.join("\n\n");

console.log("Creating final report...");

let finalResponse;

try {

  finalResponse = await groq.chat.completions.create({

  model: "llama-3.1-8b-instant",

  temperature: 0,

  response_format: {
    type: "json_object"
  },

  messages: [
      {
        role: "system",
        content: "You are an expert document auditing assistant. "
      },
      {
        role: "user",
        content: `
You are an expert document auditing assistant.


The document language is ${req.body.documentLanguage}.

Return all JSON values in ${req.body.documentLanguage}.
Return ONLY valid JSON.

STRICT JSON RULES:
- Use double quotes only.
- Escape all quotation marks inside text.
- Do not use line breaks inside string values.
- Do not add comments.
- Do not add extra fields.
- All Urdu/Arabic text must still be valid JSON strings.

Do NOT use markdown.
Do NOT wrap the JSON inside \`\`\`.


Executive Summary rules:
- Write approximately 150–200 words.
- Summarize the document's specific purpose, discussed topics, major findings, risks, recommendations, and final conclusion.
- Mention the overall quality of the document where appropriate.
- Keep the summary professional, objective, and based only on the document content.
- Do not use bullet points.
- Do not invent information that is not present in the document.

evaluationSummary FIELD RULES:

Generate ONLY a quality evaluation.

Allowed discussion:
- writing quality
- grammar
- readability
- structure
- organization
- completeness
- consistency
- professionalism

Forbidden:
- document topic
- subject
- story details
- characters
- names
- events
- examples
- technical content
- any explanation of what the document is about

Bad example:
"The story has memorable characters and good themes."

Good example:
"The document has clear writing, organized structure, consistent presentation, and professional formatting. Minor improvements may be needed in completeness and clarity."


IMPORTANT:
The executiveSummary field must NOT be a brief summary.
It must always contain 150-200 words, even for short documents.
Expand using only information available in the document.
Do not reduce the summary length.

Key Findings rules:
- keyFindings must always be an array.
- Each item must be a simple text bullet point.
- Do not return objects.
- Do not include scores inside keyFindings.
- Example:

[
 "AI improves personalized learning.",
 "AI reduces administrative workload."
]

Return exactly this structure:

Quality Analysis rules:

You MUST provide qualityAnalysis values.

Evaluate the document:

- writingQuality:
  Grammar, readability, sentence quality, clarity.

- structure:
  Organization, formatting, logical flow, sections.


themes:
Quality of organization of ideas, logical development, and completeness of discussion.

- consistency:
  Accuracy, logical consistency, and coherence.

Rules:
- Each value must be an integer from 0 to 100.
- Never leave these values as 0 unless the document is empty or unreadable.

{
  "documentType": "",
  "executiveSummary": "",
  "keyFindings": [],
  "risks": [],
  "recommendations": [],
  "qualityAnalysis": {
    "writingQuality": 0,
    "structure": 0,
    "themes": 0,
    "consistency": 0
  },
  "overallScore": 0,
  "finalVerdict": "",
  "evaluationSummary": ""
}

FIELD RULES:

finalVerdict:
- MUST contain exactly one allowed word.
- NEVER contain explanations.
- NEVER contain sentences.

Allowed:
Excellent
Good
Fair
Poor
High Risk

evaluationSummary:
- MUST contain the explanation.
- MUST only discuss quality factors.
- MUST not mention the document topic, characters, story, names, events, or examples.

overallScore:
- MUST be an integer from 0-100.
- Never use a 10-point scale.
- Example: 8/10 must become 80.

Risks rules:

Risks must evaluate the document itself.

Do not list:
- story conflicts
- fictional threats
- characters
- events
- plot problems

For creative documents:
If no document quality risks exist, return:

[
 "No significant risks were identified based on document quality."
]

   The "documentType" must contain the actual detected document type such as:
- Research Paper
- Resume / CV
- Business Report
- Story / Novel
- Legal Contract
- Personal Note

Return only one valid document type.
The document language is ${req.body.documentLanguage}.

Generate the report values in that language
  

Use the analyses below to generate the report.
IMPORTANT FINAL FILTER:

Before generating JSON:
- Remove any recommendations about changing document subject, story, characters, events, examples, or ideas.
- Recommendations must only discuss writing quality, structure, formatting, clarity, completeness, and consistency.
- Remove any risks that are fictional or content-based.

${combinedReport}
Original document text for verification:
Before generating the final JSON, rewrite and expand the executiveSummary.
Do not copy the analysis text directly.
The executiveSummary must be a complete 150-200 word paragraph.

${extractedText}
`
      }
    ]

  });

  console.log("Final AI response received");


} catch (error) {

  console.log("FINAL GROQ ERROR:");
  console.log(error);

  return res.status(500).json({
    success: false,
    message: error.message
  });

}


let aiResponse = finalResponse.choices[0].message.content;

aiResponse = aiResponse
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

console.log("========== RAW AI RESPONSE ==========");
console.log(aiResponse);
console.log("====================================");
 



  const finalReport = JSON.parse(aiResponse);
  finalReport.documentType = finalReport.documentType || req.body.documentType;


  console.log("Final report generated successfully!");


res.json({

 success: true,

 message: "Document analyzed successfully!",

 documentType: finalReport.documentType,

 documentLanguage: req.body.documentLanguage,

 report: finalReport,

});



   } catch (error) {

  console.log("ERROR:", error);

  res.status(500).json({
    success: false,
    message: error.message
  });

}

});

// ============================================
// TEST: Chromium Urdu PDF
// ============================================

app.get("/api/test-urdu-pdf", async (req, res) => {
  let browser;

  try {
    

    console.log("=================================");
    console.log("Starting Chromium Urdu PDF test...");
    console.log("=================================");

    // Local font inside frontend/public/fonts
    

   // const chromium = await import("@sparticuz/chromium");

    //const puppeteerModule = await import("puppeteer-core");
  // const puppeteer = puppeteerModule.default || puppeteerModule;

//browser = await puppeteer.launch({
 // args: chromium.default.args,
 // defaultViewport: chromium.default.defaultViewport,
 // executablePath: await chromium.default.executablePath(),
  //headless: chromium.default.headless,
//});

const chromiumModule = await import("@sparticuz/chromium");
const chromium = chromiumModule.default || chromiumModule;

const puppeteerModule = await import("puppeteer-core");
const puppeteer = puppeteerModule.default || puppeteerModule;

const executablePath = await chromium.executablePath();


if (process.env.VERCEL === "1") {
  console.log("🔥 VERCEL: Using Sparticuz Chromium");

  browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath,
    headless: chromium.headless
  });

} else {
  console.log("🔥 LOCAL: Using installed Chrome");

  browser = await puppeteer.launch({
    executablePath:
      "C:\\Users\\iShop\\.cache\\puppeteer\\chrome\\win64-151.0.7922.77\\chrome-win64\\chrome.exe",
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ]
  });
}


    const page = await browser.newPage();

    const html = `
      <!DOCTYPE html>
      <html lang="ur" dir="rtl">
      <head>
        <meta charset="UTF-8">

        <style>

          @font-face {
            font-family: "Jameel Noori Nastaleeq";
            src: url(data:font/ttf;base64,${fontBase64}) format("truetype");
            font-weight: normal;
            font-style: normal;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 60px;
            background: white;
            color: #111;
            font-family: "Jameel Noori Nastaleeq", serif;
            direction: rtl;
            text-align: right;
          }

          h1 {
            font-size: 32px;
            margin-bottom: 30px;
          }

          p {
            font-size: 25px;
            line-height: 2.2;
            margin-bottom: 25px;
          }

          .english {
            direction: ltr;
            text-align: left;
            font-family: Arial, sans-serif;
          }

        </style>
      </head>

      <body>

        <h1>اردو PDF ٹیسٹ</h1>

        <p>
          یہ ایک اردو ٹیسٹ ہے۔
        </p>

        <p>
          یہ دستاویز اردو زبان میں لکھی گئی ہے اور
          کمپیوٹر سائنس کے بارے میں معلومات فراہم کرتی ہے۔
        </p>

        <p>
          محمد علی نے کمپیوٹر سائنس میں اپنی دلچسپی
          اور مستقبل کے منصوبوں کے بارے میں بات کی۔
        </p>

        <p>
          اردو الفاظ صحیح طریقے سے جڑنے چاہئیں اور
          متن PDF میں منتخب اور کاپی کیا جا سکے۔
        </p>

        <p class="english">
          English text should also work correctly.
        </p>

      </body>
      </html>
    `;

      await page.setContent(html, {
      waitUntil: "domcontentloaded",
    timeout: 30000
      });

   
    // Make absolutely sure the font has loaded
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    console.log("Fonts ready");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm"
      }
    });

    console.log("PDF generated successfully");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="urdu-chromium-test.pdf"'
    );

    res.send(pdfBuffer);

  } catch (error) {

    console.error("========== URDU PDF TEST ERROR ==========");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  } finally {

    if (browser) {
      await browser.close();
    }

  }
});


app.post("/api/generate-pdf", async (req, res) => {
  let browser;

  try {
    console.log("🔥 SERVERLESS PDF REQUEST STARTED");

    const { html } = req.body || {};

    if (!html) {
      return res.status(400).json({
        success: false,
        message: "No HTML provided"
      });
    }

    console.log("🔥 HTML received:", html.length);

    const chromiumModule = await import("@sparticuz/chromium");
    const chromium = chromiumModule.default || chromiumModule;

    const puppeteerModule = await import("puppeteer-core");
    const puppeteer = puppeteerModule.default || puppeteerModule;

    console.log("🔥 Chromium module loaded");

    const executablePath = await chromium.executablePath();

    console.log("🔥 Chromium executable:", executablePath);

    if (process.env.VERCEL === "1") {

      console.log("🔥 VERCEL: Using Sparticuz Chromium");

      browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless
      });

    } else {

      console.log("🔥 LOCAL: Using installed Chrome");

      browser = await puppeteer.launch({
        executablePath:
          "C:\\Users\\iShop\\.cache\\puppeteer\\chrome\\win64-151.0.7922.77\\chrome-win64\\chrome.exe",
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox"
        ]
      });
    }

    console.log("🔥 Browser launched");

    const page = await browser.newPage();

    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1
    });

    /*
     * ============================================
     * LOAD JAMEEL NOORI NASTALEEQ FROM SERVER
     * ============================================
     */

    const fontPath = path.join(
      __dirname,
      "fonts",
      "Jameel Noori Nastaleeq Regular.ttf"
    );

    let fontCss = "";

    if (fs.existsSync(fontPath)) {

      console.log("🔥 Jameel font found:", fontPath);

      const fontBuffer = fs.readFileSync(fontPath);

      const fontBase64 = fontBuffer.toString("base64");

      console.log(
        "🔥 Jameel font loaded:",
        fontBuffer.length,
        "bytes"
      );

      fontCss = `
        @font-face {
          font-family: "Jameel Noori Nastaleeq";
          src: url("data:font/ttf;base64,${fontBase64}") format("truetype");
          font-weight: normal;
          font-style: normal;
        }
      `;

    } else {

      console.log(
        "⚠️ Jameel font NOT FOUND:",
        fontPath
      );
    }

    const fullHtml = `
<!DOCTYPE html>
<html>
<head>

<meta charset="UTF-8">

<style>

${fontCss}

html,
body {
  margin: 0;
  padding: 0;
  background: white;
}

* {
  box-sizing: border-box;
}

</style>

</head>

<body>

${html}

</body>

</html>
`;

    console.log("🔥 Setting page HTML");

    await page.setContent(fullHtml, {
      waitUntil: "domcontentloaded",
      timeout: 30000
    });

    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    console.log("🔥 Browser fonts ready");

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0"
      }
    });

    console.log(
      "🔥 PDF GENERATED:",
      pdfBuffer.length,
      "bytes"
    );

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="AI-Document-Audit-Report.pdf"'
    );

    res.send(pdfBuffer);

  } catch (error) {

    console.error("🔥 SERVERLESS PUPPETEER ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  } finally {

    if (browser) {

      try {
        await browser.close();

      } catch (closeError) {

        console.error(
          "Browser close error:",
          closeError
        );

      }
    }
  }
});


const PORT = process.env.PORT || 5000;
 
if(require.main === module) {
app.listen(PORT, () => {
  console.log(
    `✅ Server running on http://localhost:${PORT}` );
});
}

module.exports = app;