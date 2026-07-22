const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.use(cors());

// Home route
app.get("/", (req, res) => {
  res.send("🚀 Welcome to Document Analyzer Backend!");
});

// API route
app.get("/api/message", (req, res) => {
  res.json({
    message: "Hello from Express! 🚀"
  });
});

const PORT = 5000;

app.post("/api/upload", upload.single("document"), (req, res) => {
  res.json({
    success: true,
    message: "File uploaded successfully!",
    file: req.file,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});