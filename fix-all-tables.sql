-- =====================================================
-- Fix All Tables - Remove aktif columns
-- =====================================================

-- Drop existing tables if exists (in correct order due to foreign keys)
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS payment_types;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS students;

-- =====================================================
-- Tabel Students (Data Siswa)
-- =====================================================
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
  
  -- Indexes untuk performa
  INDEX idx_nisn (nisn),
  INDEX idx_kelas (kelas),
  INDEX idx_angkatan (angkatan),
  INDEX idx_nama (nama)
);

-- =====================================================
-- Tabel Payment Types (Jenis Pembayaran) - FIXED
-- =====================================================
CREATE TABLE payment_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nominal DECIMAL(10,2) NOT NULL,
  periode VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_nama (nama)
);

-- =====================================================
-- Tabel Users (Admin/Operator) - FIXED
-- =====================================================
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
  
  -- Indexes
  INDEX idx_username (username),
  INDEX idx_role (role)
);

-- =====================================================
-- Tabel Payments (Riwayat Pembayaran)
-- =====================================================
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
  
  -- Foreign Key
  FOREIGN KEY (student_nisn) REFERENCES students(nisn) ON UPDATE CASCADE,
  
  -- Indexes untuk performa
  INDEX idx_student_nisn (student_nisn),
  INDEX idx_tanggal_pembayaran (tanggal_pembayaran),
  INDEX idx_jenis_pembayaran (jenis_pembayaran),
  INDEX idx_status (status),
  INDEX idx_petugas (petugas)
);

-- =====================================================
-- Insert Data Default
-- =====================================================

-- Insert default payment types
INSERT INTO payment_types (nama, nominal, periode) VALUES
('SPP Bulanan', 150000.00, 'Bulanan'),
('Uang Gedung', 500000.00, 'Tahunan'),
('Uang Seragam', 300000.00, 'Tahunan'),
('Uang Buku', 200000.00, 'Tahunan'),
('Uang Kegiatan', 100000.00, 'Semester'),
('Uang Praktikum', 75000.00, 'Semester'),
('Dana Sosial', 50000.00, 'Bulanan');

-- Insert default admin user
INSERT INTO users (username, password, nama_lengkap, role, email) VALUES
('admin', '$2b$10$rOmKy.9y4ZyS4EKDOTdQHOQSj/5rqQx0x6RXz1vQKFm0qE4QjB6pe', 'Administrator SIPESDA', 'admin', 'admin@sekolah.id'),
('operator', '$2b$10$rOmKy.9y4ZyS4EKDOTdQHOQSj/5rqQx0x6RXz1vQKFm0qE4QjB6pe', 'Operator Keuangan', 'operator', 'keuangan@sekolah.id');

-- Insert sample students
INSERT INTO students (id, nisn, nama, kelas, alamat, no_hp, nama_wali, jenis_kelamin, angkatan) VALUES
(2024001001, '2024001001', 'Ahmad Rizki', '1A', 'Jl. Merdeka No. 10', '081234567890', 'Budi Santoso', 'L', '2024'),
(2024001002, '2024001002', 'Siti Nurhaliza', '1A', 'Jl. Sudirman No. 20', '081234567891', 'Eko Prasetyo', 'P', '2024'),
(2024001003, '2024001003', 'Muhammad Fajar', '1B', 'Jl. Diponegoro No. 30', '081234567892', 'Sri Wahyuni', 'L', '2024');

-- Insert sample payments
INSERT INTO payments (student_nisn, jenis_pembayaran, nominal, tanggal_pembayaran, status, keterangan, petugas) VALUES
('2024001001', 'SPP Bulanan', 150000.00, '2024-01-15', 'lunas', 'Pembayaran SPP Januari 2024', 'Operator Keuangan'),
('2024001001', 'Uang Buku', 200000.00, '2024-01-15', 'lunas', 'Pembayaran uang buku tahun ajaran 2024', 'Operator Keuangan'),
('2024001002', 'SPP Bulanan', 150000.00, '2024-01-16', 'lunas', 'Pembayaran SPP Januari 2024', 'Operator Keuangan');

-- =====================================================
-- Show Results
-- =====================================================
SHOW TABLES;

SELECT 
    'Students' as tabel,
    COUNT(*) as jumlah_record
FROM students
UNION ALL
SELECT 
    'Payment Types' as tabel,
    COUNT(*) as jumlah_record
FROM payment_types
UNION ALL
SELECT 
    'Payments' as tabel,
    COUNT(*) as jumlah_record
FROM payments
UNION ALL
SELECT 
    'Users' as tabel,
    COUNT(*) as jumlah_record
FROM users;

-- Show users table structure
DESCRIBE users;

-- Show sample users
SELECT id, username, nama_lengkap, role, email, created_at FROM users; 