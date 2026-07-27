const express = require('express');

const app = express();

// Middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.send('Bus Reservation System API is running');
});

module.exports = app;