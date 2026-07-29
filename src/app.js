const express = require("express");
const path = require("path");

const app = express();

// Parse JSON bodies
app.use(express.json());

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Serve uploaded lost & found photos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Mount API routes
app.use("/api", require("./routes"));

// Error handler: always return JSON
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;