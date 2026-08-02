require("dotenv").config();

const app = require("./src/app");
const pool = require("./src/db");
const initDB = require("./src/db/init");

const PORT = process.env.PORT || 3000;

<<<<<<< HEAD
initDB()
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error("Failed to initialize database:");
    console.error(err.message);
  });

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
=======
const startServer = async () => {
  try {
    // Initialize database tables
    await initDB(pool);
    console.log(" Database initialized successfully.");

    // Test database connection
    await pool.query("SELECT NOW()");
    console.log(" Database connection successful.");

    // Start server
    app.listen(PORT, () => {
      console.log(` Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(" Failed to start server:");
    console.error(error);
    process.exit(1);
  }
};

startServer();
>>>>>>> 7fe84ec415e32872edc0c74e576a61d842f1da4e
