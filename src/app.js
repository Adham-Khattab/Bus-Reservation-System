const express = require("express");
const path = require("path");
const lostFoundRoutes = require('./routes/lostFoundRoutes');

const app = express();

app.use(express.json());
app.use(lostFoundRoutes);
app.use(express.static(path.join(__dirname, "public")));

module.exports = app;