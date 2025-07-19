const mysql = require('mysql2/promise');
const fs = require('fs');

// Database configuration for Railway
const dbConfig = {
  host: process.env.MYSQLHOST || 'ballast.proxy.rlwy.net',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'ZOXgksyyTFcwFYmXlJvcwTLpQtgNIBPn',
  database: process.env.MYSQLDATABASE || 'railway',
  port: process.env.MYSQLPORT || 50251,
  ssl: { rejectUnauthorized: false }
};

async function updateDatabase() {
  let connection;
  
  try {
    console.log('🔄 Connecting to Railway database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to Railway database successfully!');
    
    // Read SQL file
    const sqlFile = fs.readFileSync('update_database_structure.sql', 'utf8');
    const statements = sqlFile.split(';').filter(stmt => stmt.trim());
    
    console.log('🔄 Updating database structure...');
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement && !statement.startsWith('--')) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS' || error.code === 'ER_DUP_ENTRY') {
            console.log(`⚠️  Statement ${i + 1} skipped (table exists or duplicate entry)`);
          } else {
            console.error(`❌ Error in statement ${i + 1}:`, error.message);
          }
        }
      }
    }
    
    // Verify table structures
    console.log('\n📋 Verifying table structures...');
    
    const tables = ['users', 'payment_types', 'students', 'payments'];
    
    for (const table of tables) {
      try {
        const [columns] = await connection.execute(`DESCRIBE ${table}`);
        console.log(`\n📊 Table: ${table}`);
        columns.forEach(col => {
          console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Key === 'PRI' ? 'PRIMARY KEY' : ''}`);
        });
      } catch (error) {
        console.error(`❌ Error describing table ${table}:`, error.message);
      }
    }
    
    // Check if no_hp and last_login columns were removed from users table
    console.log('\n🔍 Checking users table for removed columns...');
    const [userColumns] = await connection.execute('DESCRIBE users');
    const columnNames = userColumns.map(col => col.Field);
    
    if (!columnNames.includes('no_hp')) {
      console.log('✅ no_hp column successfully removed from users table');
    } else {
      console.log('❌ no_hp column still exists in users table');
    }
    
    if (!columnNames.includes('last_login')) {
      console.log('✅ last_login column successfully removed from users table');
    } else {
      console.log('❌ last_login column still exists in users table');
    }
    
    // Show sample data
    console.log('\n📊 Sample data from tables:');
    
    const [users] = await connection.execute('SELECT id, username, email, role FROM users LIMIT 5');
    console.log('\n👥 Users:');
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.role}) - ${user.email}`);
    });
    
    const [paymentTypes] = await connection.execute('SELECT id, nama, nominal, periode FROM payment_types LIMIT 5');
    console.log('\n💰 Payment Types:');
    paymentTypes.forEach(pt => {
      console.log(`  - ${pt.nama}: Rp${pt.nominal.toLocaleString()} (${pt.periode})`);
    });
    
    console.log('\n🎉 Database update completed successfully!');
    
  } catch (error) {
    console.error('❌ Database update failed:', error.message);
    console.error('Error details:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the update
updateDatabase().catch(console.error); 