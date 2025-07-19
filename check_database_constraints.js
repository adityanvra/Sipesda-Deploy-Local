const mysql = require('mysql2/promise');

// Database configuration for Railway
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'ballast.proxy.rlwy.net',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'ZOXgksyyTFcwFYmXlJvcwTLpQtgNIBPn',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 50251,
  ssl: { rejectUnauthorized: false }
};

async function checkDatabaseConstraints() {
  let connection;
  
  try {
    console.log('🔄 Checking database constraints and table structure...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway database successfully!');
    
    // Check students table structure
    console.log('\n📋 Students table structure:');
    const [studentColumns] = await connection.execute('DESCRIBE students');
    studentColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''} ${col.Key === 'UNI' ? 'UNIQUE' : ''}`);
    });
    
    // Check primary key
    const primaryKeyColumns = studentColumns.filter(col => col.Key === 'PRI');
    console.log('\n🔑 Primary Key columns:', primaryKeyColumns.map(col => col.Field));
    
    // Check payments table structure
    console.log('\n📋 Payments table structure:');
    const [paymentColumns] = await connection.execute('DESCRIBE payments');
    paymentColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''} ${col.Key === 'MUL' ? 'FOREIGN KEY' : ''}`);
    });
    
    // Check foreign key constraints
    console.log('\n🔗 Foreign Key constraints:');
    const [foreignKeys] = await connection.execute(`
      SELECT 
        TABLE_NAME,
        COLUMN_NAME,
        CONSTRAINT_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE REFERENCED_TABLE_SCHEMA = ? 
      AND REFERENCED_TABLE_NAME IS NOT NULL
    `, [dbConfig.database]);
    
    if (foreignKeys.length > 0) {
      foreignKeys.forEach(fk => {
        console.log(`  - ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME} (${fk.CONSTRAINT_NAME})`);
      });
    } else {
      console.log('  - No foreign key constraints found');
    }
    
    // Check for data inconsistencies
    console.log('\n🔍 Checking data consistency...');
    
    // Check if there are students with duplicate NISN
    const [duplicateNisn] = await connection.execute(`
      SELECT nisn, COUNT(*) as count 
      FROM students 
      GROUP BY nisn 
      HAVING COUNT(*) > 1
    `);
    
    if (duplicateNisn.length > 0) {
      console.log('❌ Found duplicate NISN:');
      duplicateNisn.forEach(dup => {
        console.log(`  - NISN ${dup.nisn}: ${dup.count} records`);
      });
    } else {
      console.log('✅ No duplicate NISN found');
    }
    
    // Check if there are payments referencing non-existent students
    const [orphanedPayments] = await connection.execute(`
      SELECT p.student_nisn, COUNT(*) as count
      FROM payments p
      LEFT JOIN students s ON p.student_nisn = s.nisn
      WHERE s.nisn IS NULL
      GROUP BY p.student_nisn
    `);
    
    if (orphanedPayments.length > 0) {
      console.log('❌ Found orphaned payments (referencing non-existent students):');
      orphanedPayments.forEach(orphan => {
        console.log(`  - NISN ${orphan.student_nisn}: ${orphan.count} payments`);
      });
    } else {
      console.log('✅ No orphaned payments found');
    }
    
    // Test the specific query that might be causing issues
    console.log('\n🧪 Testing specific queries...');
    
    // Test 1: Direct NISN query
    try {
      const [result1] = await connection.execute('SELECT * FROM students WHERE nisn = ?', ['2024001002']);
      console.log('✅ Direct NISN query successful, found:', result1.length, 'records');
      if (result1.length > 0) {
        console.log('  - Student data:', {
          id: result1[0].id,
          nisn: result1[0].nisn,
          nama: result1[0].nama
        });
      }
    } catch (error) {
      console.error('❌ Direct NISN query failed:', error.message);
    }
    
    // Test 2: ID query
    try {
      const [result2] = await connection.execute('SELECT * FROM students WHERE id = ?', ['2024001002']);
      console.log('✅ ID query successful, found:', result2.length, 'records');
    } catch (error) {
      console.error('❌ ID query failed:', error.message);
    }
    
    // Test 3: OR query (the one used in the route)
    try {
      const [result3] = await connection.execute('SELECT * FROM students WHERE nisn = ? OR id = ?', ['2024001002', '2024001002']);
      console.log('✅ OR query successful, found:', result3.length, 'records');
    } catch (error) {
      console.error('❌ OR query failed:', error.message);
    }
    
    // Check table indexes
    console.log('\n📊 Table indexes:');
    const [indexes] = await connection.execute('SHOW INDEX FROM students');
    indexes.forEach(index => {
      console.log(`  - ${index.Key_name}: ${index.Column_name} (${index.Non_unique ? 'Non-unique' : 'Unique'})`);
    });
    
  } catch (error) {
    console.error('❌ Database constraint check failed:', error.message);
    console.error('Error details:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the constraint check
checkDatabaseConstraints().catch(console.error); 