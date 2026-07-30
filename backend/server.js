require("dotenv").config();
const express = require("express");
const pdfParse = require("pdf-parse");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const Groq = require("groq-sdk");
const path = require("path");
const chunkText = require("./utils/chunkText");
const generalPrompt = require("./prompts/general");

const app = express();

app.use(cors({
  origin: ["https://document-analyzer-351n.vercel.app",
            "http://localhost:5174",
             "http://localhost:5173"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
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

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are an expert document classifier.

Classify the document into ONE category only.

Categories:
- Research Paper
- Resume / CV
- Legal Contract
- Business Report
- Financial Report
- Medical Report
- Story / Novel
- Meeting Minutes
- Technical Documentation
- Other

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

    const result = JSON.parse(response.choices[0].message.content);

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
           ${generalPrompt}
           Document section

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

    messages: [
      {
        role: "system",
        content: "You are an expert document auditing assistant."
      },
      {
        role: "user",
        content: `
You are an expert document auditing assistant.

Return ONLY valid JSON.

Do NOT use markdown.
Do NOT include explanations.
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

Use the analyses below to generate the report.

${combinedReport}
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


const aiResponse = finalResponse.choices[0].message.content;




  const finalReport = JSON.parse(aiResponse);


  console.log("Final report generated successfully!");


  res.json({

    success: true,

    message: "Document analyzed successfully!",

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