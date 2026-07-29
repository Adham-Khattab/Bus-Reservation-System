const path = require('path');
const express = require('express');
const app = express();
 
app.use(express.json());
 
// Serve everything in src/public (html, css, js, images) automatically.
// This line is what was missing — without it, style.css/feedback.css/images
// never load no matter how correct they are.
app.use(express.static(path.join(__dirname, 'public')));
 
app.use('/api', require('./routes'));
 
module.exports = app;