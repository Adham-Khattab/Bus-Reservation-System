require("dotenv").config();
const { Pool } = require('pg');

const { types } = require('pg');
types.setTypeParser(1082, (val) => val); 

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

module.exports = pool;
