const fs = require("fs");
const path = require("path");

module.exports = async (pool) => {
  const files = fs
    .readdirSync(__dirname)
    .filter(
      (file) =>
        file.endsWith(".js") && file !== "index.js" && file !== "init.js",
    )
    .sort();

  for (const file of files) {
    console.log(`Creating table from ${file}...`);

    const createTable = require(path.join(__dirname, file));

    if (typeof createTable === "function") {
      await createTable(pool);
    }
  }

  console.log(" Database initialized.");
};