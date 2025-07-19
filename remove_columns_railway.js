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

async function removeColumns() {
  let connection;
  
  try {
    console.log('🔄 Connecting to Railway database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway database successfully!');
    
    // Show current table structure
    console.log('\n📋 Current users table structure:');
    const [currentColumns] = await connection.execute('DESCRIBE users');
    currentColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
    });
    
    // Remove no_hp column
    console.log('\n🔄 Removing no_hp column...');
    try {
      await connection.execute('ALTER TABLE users DROP COLUMN no_hp');
      console.log('✅ no_hp column removed successfully');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('⚠️  no_hp column does not exist or cannot be dropped');
      } else {
        console.error('❌ Error removing no_hp column:', error.message);
      }
    }
    
    // Remove last_login column
    console.log('\n🔄 Removing last_login column...');
    try {
      await connection.execute('ALTER TABLE users DROP COLUMN last_login');
      console.log('✅ last_login column removed successfully');
    } catch (error) {
      if (error.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
        console.log('⚠️  last_login column does not exist or cannot be dropped');
      } else {
        console.error('❌ Error removing last_login column:', error.message);
      }
    }
    
    // Show updated table structure
    console.log('\n📋 Updated users table structure:');
    const [updatedColumns] = await connection.execute('DESCRIBE users');
    updatedColumns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
    });
    
    // Verify columns were removed
    const columnNames = updatedColumns.map(col => col.Field);
    
    if (!columnNames.includes('no_hp')) {
      console.log('\n✅ no_hp column successfully removed from users table');
    } else {
      console.log('\n❌ no_hp column still exists in users table');
    }
    
    if (!columnNames.includes('last_login')) {
      console.log('✅ last_login column successfully removed from users table');
    } else {
      console.log('❌ last_login column still exists in users table');
    }
    
    console.log('\n🎉 Column removal completed successfully!');
    
  } catch (error) {
    console.error('❌ Column removal failed:', error.message);
    console.error('Error details:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the column removal
removeColumns().catch(console.error); 