const mysql = require('mysql2/promise');
const fs = require('fs');

// Database configuration for Railway
const dbConfig = {
  host: process.env.MYSQLHOST || process.env.DB_HOST || 'ballast.proxy.rlwy.net',
  user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'ZOXgksyyTFcwFYmXlJvcwTLpQtgNIBPn',
  database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
  port: process.env.MYSQLPORT || process.env.DB_PORT || 50251,
  ssl: { rejectUnauthorized: false }
};

async function fixDatabaseStructure() {
  let connection;
  
  try {
    console.log('🔄 Fixing database structure...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway database successfully!');
    
    // Read SQL file
    const sqlFile = fs.readFileSync('fix_database_structure.sql', 'utf8');
    const statements = sqlFile.split(';').filter(stmt => stmt.trim());
    
    console.log('🔄 Executing database fixes...');
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement && !statement.startsWith('--')) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.code === 'ER_CANT_DROP' || error.code === 'ER_DUP_KEYNAME' || error.code === 'ER_DUP_FIELDNAME') {
            console.log(`⚠️  Statement ${i + 1} skipped (constraint/column already exists or doesn't exist):`, error.message);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    // Verify the fixes
    console.log('\n📋 Verifying database structure after fixes...');
    
    // Check students table structure
    const [studentColumns] = await connection.execute('DESCRIBE students');
    console.log('\n📊 Students table structure:');
    studentColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''} ${col.Key === 'UNI' ? 'UNIQUE' : ''}`);
    });
    
    // Check primary key
    const primaryKeyColumns = studentColumns.filter(col => col.Key === 'PRI');
    console.log('\n🔑 Primary Key columns:', primaryKeyColumns.map(col => col.Field));
    
    // Check foreign key constraints
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
    
    console.log('\n🔗 Foreign Key constraints:');
    if (foreignKeys.length > 0) {
      foreignKeys.forEach(fk => {
        console.log(`  - ${fk.TABLE_NAME}.${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME} (${fk.CONSTRAINT_NAME})`);
      });
    } else {
      console.log('  - No foreign key constraints found');
    }
    
    // Test the endpoint query again
    console.log('\n🧪 Testing endpoint query after fixes...');
    const [results] = await connection.execute('SELECT * FROM students WHERE nisn = ? OR id = ?', ['2024001002', '2024001002']);
    console.log('✅ Query successful, found:', results.length, 'records');
    
    if (results.length > 0) {
      console.log('✅ Student data:', {
        id: results[0].id,
        nisn: results[0].nisn,
        nama: results[0].nama
      });
    }
    
    console.log('\n🎉 Database structure fixes completed successfully!');
    
  } catch (error) {
    console.error('❌ Database structure fix failed:', error.message);
    console.error('Error details:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the database structure fix
fixDatabaseStructure().catch(console.error); 