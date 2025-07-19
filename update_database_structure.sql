-- Update Database Structure for SIPESDA
-- Railway Database Configuration

-- Drop existing tables if they exist (be careful with this in production)
-- DROP TABLE IF EXISTS payments;
-- DROP TABLE IF EXISTS students;
-- DROP TABLE IF EXISTS payment_types;
-- DROP TABLE IF EXISTS users;

-- Create users table (removing no_hp and last_login columns)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role ENUM('admin', 'operator') DEFAULT 'operator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create payment_types table
CREATE TABLE IF NOT EXISTS payment_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    nominal DECIMAL(10,2) NOT NULL,
    periode VARCHAR(50),
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    nisn VARCHAR(20) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kelas VARCHAR(10),
    alamat TEXT,
    nama_wali VARCHAR(100),
    jenis_kelamin ENUM('L', 'P') DEFAULT 'L',
    angkatan VARCHAR(4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_nisn VARCHAR(20) NOT NULL,
    jenis_pembayaran VARCHAR(100) NOT NULL,
    nominal DECIMAL(10,2) NOT NULL,
    tanggal_pembayaran DATE NOT NULL,
    status ENUM('lunas', 'belum_lunas') DEFAULT 'lunas',
    keterangan TEXT,
    catatan TEXT,
    petugas VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_nisn) REFERENCES students(nisn) ON DELETE CASCADE
);

-- Insert default admin user
INSERT INTO users (username, password, email, role) VALUES 
('admin', 'admin123', 'admin@sipesda.com', 'admin'),
('operator', 'operator123', 'operator@sipesda.com', 'operator')
ON DUPLICATE KEY UPDATE 
    password = VALUES(password),
    email = VALUES(email),
    role = VALUES(role);

-- Insert default payment types
INSERT INTO payment_types (nama, nominal, periode, aktif) VALUES 
('SPP Bulanan', 150000.00, 'Bulanan', TRUE),
('Uang Makan', 50000.00, 'Bulanan', TRUE),
('Seragam Sekolah', 250000.00, 'Sekali Bayar', TRUE),
('Buku Pelajaran', 100000.00, 'Sekali Bayar', TRUE)
ON DUPLICATE KEY UPDATE 
    nominal = VALUES(nominal),
    periode = VALUES(periode),
    aktif = VALUES(aktif);

-- Show table structure
DESCRIBE users;
DESCRIBE payment_types;
DESCRIBE students;
DESCRIBE payments; 