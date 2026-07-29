const express = require("express");
const path = require("path");

const app = express();

// Serve static files from the src/public folder
app.use(express.static(path.join(__dirname, "public")));

module.exports = app;