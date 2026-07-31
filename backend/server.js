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


app.use(express.json());

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
       response_format: {
    type: "json_object"
  },
      messages: [
        {
          role: "system",
          content: `
You are an expert document classifier.

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
  "confidence": 0
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
      
      messages: [
        {
          role: "system",
          content: `
You are an expert language detector.

Detect the primary language of the document.

Return ONLY valid JSON.

{
  "language": "",
  "confidence": 0
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

      messages: [
        {
          role: "system",
          content: "You are a document auditing assistant."
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

  response_format: {
    type: "json_object"
  },

  messages: [
      {
        role: "system",
        content: "You are an expert document auditing assistant."
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

Return exactly this structure:

{
  "executiveSummary": "",
  "keyFindings": [],
  "risks": [],
  "recommendations": [],
  "overallScore": 0,
  "finalVerdict": ""
}
   
The document language is ${req.body.documentLanguage}.

Generate the report values in that language
  

Use the analyses below to generate the report.

${combinedReport}
Original document text for verification:

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


  console.log("Final report generated successfully!");


  res.json({

    success: true,

    message: "Document analyzed successfully!",

      documentType: req.body.documentType,


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

const PORT = process.env.PORT || 5000;
 
if(require.main === module) {
app.listen(PORT, () => {
  console.log(
    `✅ Server running on http://localhost:${PORT}` );
});
}

module.exports = app;