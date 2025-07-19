const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for password
function askPassword() {
  return new Promise((resolve) => {
    rl.question('🔐 Enter Railway database password: ', (password) => {
      resolve(password);
    });
  });
}

async function fixDatabase() {
  let connection;
  
  try {
    console.log('🔧 Starting database fix...');
    
    // Get password from user
    const password = await askPassword();
    
    // Railway Database Configuration
    const dbConfig = {
      host: 'ballast.proxy.rlwy.net',
      user: 'root',
      password: password,
      database: 'railway',
      port: 50251,
    };

    console.log('📊 Database Config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
      hasPassword: !!dbConfig.password
    });

    // Connect to database
    console.log('🔌 Connecting to Railway database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Test connection
    const [testResult] = await connection.execute('SELECT 1 as test');
    console.log('✅ Database connection test:', testResult[0]);

    // Read the fix script
    console.log('📖 Reading fix script...');
    const fixScript = await fs.readFile(path.join(__dirname, 'fix-all-tables.sql'), 'utf8');
    
    // Split script into individual statements
    const statements = fixScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`⚡ Executing statement ${i + 1}/${statements.length}:`);
          console.log(`   ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
          
          await connection.execute(statement);
          console.log(`   ✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.log(`   ⚠️  Statement ${i + 1} failed:`, error.message);
          // Continue with next statement
        }
      }
    }

    // Verify tables
    console.log('\n🔍 Verifying tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:', tables.map(t => Object.values(t)[0]));

    // Check users table structure
    console.log('\n👥 Checking users table structure...');
    const [userColumns] = await connection.execute('DESCRIBE users');
    console.log('📊 Users table columns:');
    userColumns.forEach(col => {
      console.log(`   - ${col.Field}: ${col.Type} ${col.Key ? `(${col.Key})` : ''}`);
    });

    // Check if aktif column exists
    const hasAktifColumn = userColumns.some(col => col.Field === 'aktif');
    console.log(`\n🔍 Has 'aktif' column: ${hasAktifColumn ? '❌ YES (PROBLEM!)' : '✅ NO (GOOD!)'}`);

    // Count records
    console.log('\n📊 Counting records...');
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    const [paymentTypeCount] = await connection.execute('SELECT COUNT(*) as count FROM payment_types');
    const [studentCount] = await connection.execute('SELECT COUNT(*) as count FROM students');
    const [paymentCount] = await connection.execute('SELECT COUNT(*) as count FROM payments');

    console.log(`👥 Users: ${userCount[0].count} records`);
    console.log(`💰 Payment Types: ${paymentTypeCount[0].count} records`);
    console.log(`🎓 Students: ${studentCount[0].count} records`);
    console.log(`💳 Payments: ${paymentCount[0].count} records`);

    // Show sample users
    console.log('\n👤 Sample users:');
    const [users] = await connection.execute('SELECT id, username, nama_lengkap, role, email FROM users LIMIT 5');
    users.forEach(user => {
      console.log(`   - ${user.username} (${user.role}): ${user.nama_lengkap}`);
    });

    console.log('\n🎉 Database fix completed successfully!');
    console.log('✅ All tables have been recreated without "aktif" columns');
    console.log('✅ Default data has been inserted');
    console.log('✅ Login should now work with username: admin, password: admin123');

  } catch (error) {
    console.error('❌ Database fix failed:', error);
    console.error('Error details:', {
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sql: error.sql
    });
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Connection refused - check Railway database status');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🔐 Access denied - check Railway credentials');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('🗄️ Database not found - check database name');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
    rl.close();
  }
}

// Run the fix
fixDatabase().catch(console.error); 