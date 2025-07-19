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

// Simulate the exact logic from the students.js route
async function testStudentEndpoint() {
  let connection;
  
  try {
    console.log('🔄 Testing student endpoint logic...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway database successfully!');
    
    // Test with the problematic NISN
    const testId = '2024001002';
    console.log('🔍 Testing with ID/NISN:', testId);
    
    // Simulate the exact logic from the route
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
    
    console.log('📋 Executing SQL:', sql, 'with params:', [param]);
    const [results] = await connection.execute(sql, sql.includes('OR') ? [param, param] : [param]);
    console.log('📋 Query results:', results.length, 'records found');
    
    if (results.length === 0) {
      console.log('❌ Student not found - should return 404');
      return { status: 404, error: 'Siswa tidak ditemukan', searchedId: testId };
    }
    
    console.log('✅ Student found:', results[0].nama);
    return { status: 200, data: results[0] };
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('❌ Error details:', error.code, error.errno, error.sqlMessage);
    return { 
      status: 500, 
      error: 'Database error', 
      details: error.message,
      code: error.code,
      sqlMessage: error.sqlMessage 
    };
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Test multiple scenarios
async function runTests() {
  console.log('🧪 Running comprehensive endpoint tests...\n');
  
  // Test 1: Valid NISN
  console.log('=== Test 1: Valid NISN (2024001002) ===');
  const result1 = await testStudentEndpoint();
  console.log('Result:', result1);
  console.log('');
  
  // Test 2: Empty ID
  console.log('=== Test 2: Empty ID ===');
  const testId2 = '';
  if (!testId2 || testId2.trim() === '') {
    console.log('❌ Invalid ID/NISN provided - should return 400');
    console.log('Result: { status: 400, error: "ID/NISN tidak valid" }');
  }
  console.log('');
  
  // Test 3: Short ID
  console.log('=== Test 3: Short ID (123) ===');
  const testId3 = '123';
  if (testId3.length <= 10) {
    console.log('🔍 This would use OR query (nisn = ? OR id = ?)');
  }
  console.log('');
  
  // Test 4: Check database structure
  console.log('=== Test 4: Database Structure Check ===');
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [columns] = await connection.execute('DESCRIBE students');
    console.log('📋 Students table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
    });
    await connection.end();
  } catch (error) {
    console.error('❌ Error checking table structure:', error.message);
  }
  
  console.log('\n🎉 All tests completed!');
}

// Run the tests
runTests().catch(console.error); 