require('dotenv').config();

const app = require('./src/app');
const pool = require('./src/db');

const PORT = process.env.PORT || 3000;


const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS buses (
                id SERIAL PRIMARY KEY,
                bus_number VARCHAR(50),
                capacity INT
            )
        `);

        console.log("Database initialized");
    } catch (error) {
        console.error("Failed to initialise database:", error.message);
    }
};


initDB();


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});