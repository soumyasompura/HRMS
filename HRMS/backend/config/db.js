// config/db.js
const mysql = require('mysql2/promise');
const dns = require('dns');

// Force Node to prefer IPv4 when resolving hostnames
dns.setDefaultResultOrder('ipv4first');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 20000,
});

module.exports = pool;