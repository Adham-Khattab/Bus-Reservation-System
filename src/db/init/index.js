const fs = require('fs');
const path = require('path');
const pool = require('../index');

module.exports = async () => {
    const files = fs.readdirSync(__dirname).filter(f => f !== 'index.js');
    for (const file of files) {
        const createTable = require(path.join(__dirname, file));
        await createTable(pool);
    }
    console.log('Database initialized');
};