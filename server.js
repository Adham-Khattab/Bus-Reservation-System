// startServer();
require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/db");
const initDB = require("./src/db/init");

const PORT = process.env.PORT || 3000;

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  try {
    // Initialize database tables
    await initDB();
    console.log("Database initialized successfully.");

    // Test database connection
    await pool.query("SELECT NOW()");
    console.log("Database connection successful.");

    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:");
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
