const mysql = require('mysql2/promise');

// Database configuration for Railway
const dbConfig = {
  host: process.env.MYSQLHOST || 'ballast.proxy.rlwy.net',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'ZOXgksyyTFcwFYmXlJvcwTLpQtgNIBPn',
  database: process.env.MYSQLDATABASE || 'railway',
  port: process.env.MYSQLPORT || 50251,
  ssl: { rejectUnauthorized: false }
};

async function checkDatabaseStructure() {
  let connection;
  
  try {
    console.log('🔄 Connecting to Railway database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway database successfully!');
    
    // Check students table structure
    console.log('\n📋 Students table structure:');
    const [studentColumns] = await connection.execute('DESCRIBE students');
    studentColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
    });
    
    // Check if there are any students with NISN 2024001001
    console.log('\n🔍 Checking for student with NISN 2024001001...');
    const [students] = await connection.execute('SELECT * FROM students WHERE nisn = ?', ['2024001001']);
    
    if (students.length > 0) {
      console.log('✅ Student found:', students[0]);
    } else {
      console.log('❌ Student with NISN 2024001001 not found');
      
      // Show all students
      const [allStudents] = await connection.execute('SELECT nisn, nama FROM students LIMIT 10');
      console.log('\n📊 Sample students in database:');
      allStudents.forEach(student => {
        console.log(`  - ${student.nisn}: ${student.nama}`);
      });
    }
    
    // Test the exact query that might be causing the 400 error
    console.log('\n🧪 Testing queries...');
    
    // Test 1: Direct NISN query
    try {
      const [result1] = await connection.execute('SELECT * FROM students WHERE nisn = ?', ['2024001001']);
      console.log('✅ Direct NISN query successful, found:', result1.length, 'records');
    } catch (error) {
      console.error('❌ Direct NISN query failed:', error.message);
    }
    
    // Test 2: OR query (like in the route)
    try {
      const [result2] = await connection.execute('SELECT * FROM students WHERE nisn = ? OR id = ?', ['2024001001', '2024001001']);
      console.log('✅ OR query successful, found:', result2.length, 'records');
    } catch (error) {
      console.error('❌ OR query failed:', error.message);
    }
    
    // Check if there's an 'id' column in students table
    const hasIdColumn = studentColumns.some(col => col.Field === 'id');
    console.log('\n📊 Students table has ID column:', hasIdColumn);
    
    if (hasIdColumn) {
      // Test query with ID column
      try {
        const [result3] = await connection.execute('SELECT * FROM students WHERE id = ?', ['2024001001']);
        console.log('✅ ID query successful, found:', result3.length, 'records');
      } catch (error) {
        console.error('❌ ID query failed:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error.message);
    console.error('Error details:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the check
checkDatabaseStructure().catch(console.error); 