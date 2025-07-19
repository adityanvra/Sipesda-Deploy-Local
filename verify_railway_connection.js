const mysql = require('mysql2/promise');

// Database configuration for Railway (same as backend/db.js)
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'ballast.proxy.rlwy.net',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'ZOXgksyyTFcwFYmXlJvcwTLpQtgNIBPn',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 50251,
  ssl: { rejectUnauthorized: false }
};

async function verifyRailwayConnection() {
  let connection;
  
  try {
    console.log('🔄 Verifying Railway database connection...');
    console.log('📋 Database config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
      hasPassword: !!dbConfig.password
    });
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway database successfully!');
    
    // Test the specific student that's causing the 400 error
    console.log('\n🔍 Testing student with NISN 2024001002...');
    const [students] = await connection.execute('SELECT * FROM students WHERE nisn = ?', ['2024001002']);
    
    if (students.length > 0) {
      console.log('✅ Student found:', {
        nisn: students[0].nisn,
        nama: students[0].nama,
        kelas: students[0].kelas
      });
    } else {
      console.log('❌ Student with NISN 2024001002 not found');
      
      // Show all students
      const [allStudents] = await connection.execute('SELECT nisn, nama, kelas FROM students LIMIT 10');
      console.log('\n📊 Sample students in database:');
      allStudents.forEach(student => {
        console.log(`  - ${student.nisn}: ${student.nama} (${student.kelas})`);
      });
    }
    
    // Test the exact query that the backend uses
    console.log('\n🧪 Testing backend query logic...');
    
    const testId = '2024001002';
    let sql, param;
    
    if (testId.length > 10) {
      sql = 'SELECT * FROM students WHERE nisn = ?';
      param = testId;
      console.log('🔍 Using NISN query for:', testId);
    } else {
      sql = 'SELECT * FROM students WHERE nisn = ? OR id = ?';
      param = testId;
      console.log('🔍 Using OR query for:', testId);
    }
    
    const [results] = await connection.execute(sql, sql.includes('OR') ? [param, param] : [param]);
    console.log('📋 Query results:', results.length, 'records found');
    
    if (results.length > 0) {
      console.log('✅ Query successful, student found:', results[0].nama);
    } else {
      console.log('❌ Query returned no results');
    }
    
    // Check environment variables
    console.log('\n📋 Environment variables check:');
    console.log('MYSQLHOST:', process.env.MYSQLHOST || 'not set');
    console.log('MYSQLUSER:', process.env.MYSQLUSER || 'not set');
    console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE || 'not set');
    console.log('MYSQLPORT:', process.env.MYSQLPORT || 'not set');
    console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? 'set' : 'not set');
    
    console.log('\n🎉 Railway database verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Railway database verification failed:', error.message);
    console.error('Error details:', error);
    
    // Show connection details for debugging
    console.log('\n🔍 Connection details for debugging:');
    console.log('Host:', dbConfig.host);
    console.log('Port:', dbConfig.port);
    console.log('Database:', dbConfig.database);
    console.log('User:', dbConfig.user);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the verification
verifyRailwayConnection().catch(console.error); 