require("dotenv").config();
const express = require("express");
const { PDFParse } = require("pdf-parse");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");
const Groq = require("groq-sdk");
const path = require("path");



const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// File storage setup
const storage = multer.diskStorage({
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


app.post("/api/upload", upload.single("document"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }


    // 1. Read uploaded PDF
    const dataBuffer = fs.readFileSync(req.file.path);


    // 2. Extract text
    const parser = new PDFParse({
      data: dataBuffer
    });

    const result = await parser.getText();

    const extractedText = result.text;


    console.log("Text extracted:");
    console.log(extractedText.substring(0, 300));


   // 3. Send text to Groq

const response = await groq.chat.completions.create({

  model: "llama-3.1-8b-instant",

  messages: [
    {
      role: "system",
      content: "You are a document auditing assistant."
    },

    {
      role: "user",
      content: `
Analyze this document.

Provide:
1. Summary
2. Important points
3. Possible issues
4. Risk level

Document:

${extractedText}
`
    }
  ]

});


const summary = response.choices[0].message.content;


    // 4. Return result
    res.json({
      success: true,
      message: "Document analyzed successfully!",
      summary: summary
    });


  } catch(error) {

    console.log("ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });

  }

});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `✅ Server running on http://localhost:${PORT}`
  );

});


