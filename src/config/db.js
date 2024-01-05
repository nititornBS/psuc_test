const mysql = require('mysql2');

const { envHOST, envUSER, envPASS, envNAME } = require('../helpers/env');

const pool = mysql.createPool({
  host: envHOST,
  user: envUSER,
  password: envPASS,
  database: envNAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
