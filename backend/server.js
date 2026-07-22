const express = require("express");
const cors = require("cors");

const app = express();

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

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});