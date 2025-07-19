const mysql = require('mysql2/promise');

// Create connection pool for serverless functions
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql.railway.internal',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 3306,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Test connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ Tersambung ke MySQL (${process.env.DB_NAME || 'railway'})`);
    connection.release();
  } catch (err) {
    console.error('❌ Koneksi ke database gagal:', err.message);
  }
}

// Test connection on startup
if (process.env.NODE_ENV !== 'production') {
  testConnection();
}

module.exports = pool;
