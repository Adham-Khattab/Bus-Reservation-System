require('dotenv').config();

const app = require('./src/app');
const initDB = require('./src/db/init');

const PORT = process.env.PORT || 3000;

initDB().catch(err => {
    console.error("❌ Failed to initialize database:");
    console.error(err.message);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});  