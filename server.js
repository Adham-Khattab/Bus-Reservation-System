require("dotenv").config();

const app = require("./src/app");
const initDB = require("./src/db/init");

const PORT = process.env.PORT || 3000;

initDB().catch((err) => {
  console.error("Failed to initialize database:");
  console.error(err.message);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/db/init");

const PORT = process.env.PORT || 3000;

// ==========================================
// TEST DATABASE CONNECTION
// ==========================================

const testDatabase = async () => {
  try {
    await pool.query("SELECT NOW()");

    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error.message);
  }
};

// ==========================================
// START SERVER
// ==========================================

const startServer = async () => {
  await testDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
