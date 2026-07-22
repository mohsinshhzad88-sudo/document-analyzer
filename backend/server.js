const express = require("express");
const { PDFParse } = require("pdf-parse");
const fs = require("fs");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());


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


// Upload document
app.post("/api/upload", upload.single("document"), (req, res) => {

  res.json({
    success: true,
    message: "File uploaded successfully!",
    file: req.file.filename,
    path: req.file.path
  });

});


// PDF text extraction test
app.get("/api/test-pdf", async (req, res) => {

  try {

    const dataBuffer = fs.readFileSync(
      "uploadss/"+req.query.file
    );


    const parser = new PDFParse({
      data: dataBuffer
    });


    const result = await parser.getText();


    res.json({
      text: result.text
    });


  } catch (error) {

    console.log("PDF ERROR:", error);


    res.status(500).json({
      message: error.message
    });

  }

});


// Start server
const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `✅ Server running on http://localhost:${PORT}`
  );
});