const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'SMS',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = pool.promise();

// Verify database connection at startup.
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err.message || err);
  } else {
    console.log('Database is connected successfully.');
    connection.release();
  }
});

module.exports = db;
