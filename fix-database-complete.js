const mysql = require('mysql2/promise');

// Railway Database Configuration with correct credentials
const dbConfig = {
  host: 'ballast.proxy.rlwy.net',
  user: 'root',
  password: 'ZOXgksyyTFcwFYmXlJvcwTLpQtgNIBPn',
  database: 'railway',
  port: 50251,
};

async function fixDatabase() {
  let connection;
  
  try {
    console.log('🔧 Starting complete database fix...');
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

    // Check current tables
    console.log('\n🔍 Checking current tables...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Current tables:', tables.map(t => Object.values(t)[0]));

    // Drop existing tables in correct order
    console.log('\n🗑️ Dropping existing tables...');
    try {
      await connection.execute('DROP TABLE IF EXISTS payments');
      console.log('✅ Dropped payments table');
    } catch (error) {
      console.log('⚠️ Error dropping payments:', error.message);
    }

    try {
      await connection.execute('DROP TABLE IF EXISTS payment_types');
      console.log('✅ Dropped payment_types table');
    } catch (error) {
      console.log('⚠️ Error dropping payment_types:', error.message);
    }

    try {
      await connection.execute('DROP TABLE IF EXISTS users');
      console.log('✅ Dropped users table');
    } catch (error) {
      console.log('⚠️ Error dropping users:', error.message);
    }

    try {
      await connection.execute('DROP TABLE IF EXISTS students');
      console.log('✅ Dropped students table');
    } catch (error) {
      console.log('⚠️ Error dropping students:', error.message);
    }

    // Create tables
    console.log('\n🏗️ Creating tables...');

    // Create students table
    console.log('📝 Creating students table...');
    await connection.execute(`
      CREATE TABLE students (
        id BIGINT PRIMARY KEY,
        nisn VARCHAR(20) UNIQUE NOT NULL,
        nama VARCHAR(100) NOT NULL,
        kelas VARCHAR(10) NOT NULL,
        alamat TEXT,
        no_hp VARCHAR(20),
        nama_wali VARCHAR(100) NOT NULL,
        jenis_kelamin ENUM('L', 'P') NOT NULL,
        angkatan VARCHAR(4) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_nisn (nisn),
        INDEX idx_kelas (kelas),
        INDEX idx_angkatan (angkatan),
        INDEX idx_nama (nama)
      )
    `);
    console.log('✅ Students table created');

    // Create payment_types table
    console.log('📝 Creating payment_types table...');
    await connection.execute(`
      CREATE TABLE payment_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama VARCHAR(100) NOT NULL,
        nominal DECIMAL(10,2) NOT NULL,
        periode VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_nama (nama)
      )
    `);
    console.log('✅ Payment_types table created');

    // Create users table
    console.log('📝 Creating users table...');
    await connection.execute(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nama_lengkap VARCHAR(100) NOT NULL,
        role ENUM('admin', 'operator') DEFAULT 'operator',
        email VARCHAR(100),
        no_hp VARCHAR(20),
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        
        INDEX idx_username (username),
        INDEX idx_role (role)
      )
    `);
    console.log('✅ Users table created');

    // Create payments table
    console.log('📝 Creating payments table...');
    await connection.execute(`
      CREATE TABLE payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_nisn VARCHAR(20) NOT NULL,
        jenis_pembayaran VARCHAR(100) NOT NULL,
        nominal DECIMAL(10,2) NOT NULL,
        tanggal_pembayaran DATE NOT NULL,
        status ENUM('lunas', 'belum_lunas') DEFAULT 'lunas',
        keterangan TEXT,
        catatan TEXT,
        petugas VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (student_nisn) REFERENCES students(nisn) ON UPDATE CASCADE,
        
        INDEX idx_student_nisn (student_nisn),
        INDEX idx_tanggal_pembayaran (tanggal_pembayaran),
        INDEX idx_jenis_pembayaran (jenis_pembayaran),
        INDEX idx_status (status),
        INDEX idx_petugas (petugas)
      )
    `);
    console.log('✅ Payments table created');

    // Insert default data
    console.log('\n📊 Inserting default data...');

    // Insert payment types
    console.log('💰 Inserting payment types...');
    await connection.execute(`
      INSERT INTO payment_types (nama, nominal, periode) VALUES
      ('SPP Bulanan', 150000.00, 'Bulanan'),
      ('Uang Gedung', 500000.00, 'Tahunan'),
      ('Uang Seragam', 300000.00, 'Tahunan'),
      ('Uang Buku', 200000.00, 'Tahunan'),
      ('Uang Kegiatan', 100000.00, 'Semester'),
      ('Uang Praktikum', 75000.00, 'Semester'),
      ('Dana Sosial', 50000.00, 'Bulanan')
    `);
    console.log('✅ Payment types inserted');

    // Insert users
    console.log('👥 Inserting users...');
    await connection.execute(`
      INSERT INTO users (username, password, nama_lengkap, role, email) VALUES
      ('admin', '$2b$10$rOmKy.9y4ZyS4EKDOTdQHOQSj/5rqQx0x6RXz1vQKFm0qE4QjB6pe', 'Administrator SIPESDA', 'admin', 'admin@sekolah.id'),
      ('operator', '$2b$10$rOmKy.9y4ZyS4EKDOTdQHOQSj/5rqQx0x6RXz1vQKFm0qE4QjB6pe', 'Operator Keuangan', 'operator', 'keuangan@sekolah.id')
    `);
    console.log('✅ Users inserted');

    // Insert students
    console.log('🎓 Inserting students...');
    await connection.execute(`
      INSERT INTO students (id, nisn, nama, kelas, alamat, no_hp, nama_wali, jenis_kelamin, angkatan) VALUES
      (2024001001, '2024001001', 'Ahmad Rizki', '1A', 'Jl. Merdeka No. 10', '081234567890', 'Budi Santoso', 'L', '2024'),
      (2024001002, '2024001002', 'Siti Nurhaliza', '1A', 'Jl. Sudirman No. 20', '081234567891', 'Eko Prasetyo', 'P', '2024'),
      (2024001003, '2024001003', 'Muhammad Fajar', '1B', 'Jl. Diponegoro No. 30', '081234567892', 'Sri Wahyuni', 'L', '2024')
    `);
    console.log('✅ Students inserted');

    // Insert payments
    console.log('💳 Inserting payments...');
    await connection.execute(`
      INSERT INTO payments (student_nisn, jenis_pembayaran, nominal, tanggal_pembayaran, status, keterangan, petugas) VALUES
      ('2024001001', 'SPP Bulanan', 150000.00, '2024-01-15', 'lunas', 'Pembayaran SPP Januari 2024', 'Operator Keuangan'),
      ('2024001001', 'Uang Buku', 200000.00, '2024-01-15', 'lunas', 'Pembayaran uang buku tahun ajaran 2024', 'Operator Keuangan'),
      ('2024001002', 'SPP Bulanan', 150000.00, '2024-01-16', 'lunas', 'Pembayaran SPP Januari 2024', 'Operator Keuangan')
    `);
    console.log('✅ Payments inserted');

    // Verify tables
    console.log('\n🔍 Verifying tables...');
    const [finalTables] = await connection.execute('SHOW TABLES');
    console.log('📋 Final tables:', finalTables.map(t => Object.values(t)[0]));

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

    console.log('\n🎉 Complete database fix finished successfully!');
    console.log('✅ All 4 tables have been created');
    console.log('✅ No "aktif" columns in any table');
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
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the fix
fixDatabase().catch(console.error); 