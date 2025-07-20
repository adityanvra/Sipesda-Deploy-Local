const mysql = require('mysql2/promise');

// Create connection pool for Laragon localhost
const pool = mysql.createPool({
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'sipesda',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`✅ Tersambung ke MySQL Laragon (${process.env.DB_NAME || 'sipesda'})`);
    connection.release();
  } catch (err) {
    console.error('❌ Koneksi ke database gagal:', err.message);
    console.log('💡 Pastikan database "sipesda" sudah dibuat di Laragon MySQL');
    console.log('💡 Import file database_sipesda_laragon.sql ke phpMyAdmin');
  }
}

// Test connection on startup
testConnection();

module.exports = pool;
