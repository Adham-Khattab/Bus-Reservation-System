require("dotenv").config();
<<<<<<< HEAD

const { Pool } = require("pg");
=======
const { Pool } = require('pg');
>>>>>>> fd9965231080241b29128e757e0ed84f03772686

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;
