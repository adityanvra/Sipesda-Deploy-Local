-- =====================================================
-- SIPESDA Database Setup Script untuk Deployment Lokal
-- =====================================================
-- 
-- Instruksi:
-- 1. Login ke MySQL: mysql -u root -p
-- 2. Copy-paste script ini satu per satu
-- 3. Atau jalankan: source database-setup-lokal.sql
--
-- =====================================================

-- Hapus database jika sudah ada (HATI-HATI!)
-- DROP DATABASE IF EXISTS sipesda_sekolah;

-- Buat database baru
CREATE DATABASE IF NOT EXISTS sipesda_sekolah 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Gunakan database
USE sipesda_sekolah;

-- =====================================================
-- Tabel Students (Data Siswa)
-- =====================================================
CREATE TABLE IF NOT EXISTS students (
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
-- Tabel Payment Types (Jenis Pembayaran)
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nominal DECIMAL(10,2) NOT NULL,
  periode VARCHAR(50) NOT NULL,
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_nama (nama),
  INDEX idx_aktif (aktif)
);

-- =====================================================
-- Tabel Payments (Riwayat Pembayaran)
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
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
-- Tabel Users (Admin/Operator) - OPSIONAL
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nama_lengkap VARCHAR(100) NOT NULL,
  role ENUM('admin', 'operator') DEFAULT 'operator',
  email VARCHAR(100),
  no_hp VARCHAR(20),
  aktif BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_aktif (aktif)
);

-- =====================================================
-- Insert Data Default Payment Types
-- =====================================================
INSERT INTO payment_types (nama, nominal, periode, aktif) VALUES
('SPP Bulanan', 150000.00, 'Bulanan', TRUE),
('Uang Gedung', 500000.00, 'Tahunan', TRUE),
('Uang Seragam', 300000.00, 'Tahunan', TRUE),
('Uang Buku', 200000.00, 'Tahunan', TRUE),
('Uang Kegiatan', 100000.00, 'Semester', TRUE),
('Uang Praktikum', 75000.00, 'Semester', TRUE),
('Dana Sosial', 50000.00, 'Bulanan', TRUE)
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- Insert Data Admin Default (GANTI PASSWORD!)
-- =====================================================
INSERT INTO users (username, password, nama_lengkap, role, email) VALUES
('admin', '$2b$10$rOmKy.9y4ZyS4EKDOTdQHOQSj/5rqQx0x6RXz1vQKFm0qE4QjB6pe', 'Administrator SIPESDA', 'admin', 'admin@sekolah.id'),
('operator', '$2b$10$rOmKy.9y4ZyS4EKDOTdQHOQSj/5rqQx0x6RXz1vQKFm0qE4QjB6pe', 'Operator Keuangan', 'operator', 'keuangan@sekolah.id')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Note: Password default untuk admin dan operator adalah "admin123"
-- Segera ganti password setelah login pertama!

-- =====================================================
-- Insert Data Siswa Contoh (HAPUS SETELAH TESTING)
-- =====================================================
INSERT INTO students (id, nisn, nama, kelas, alamat, no_hp, nama_wali, jenis_kelamin, angkatan) VALUES
(2024001001, '2024001001', 'Ahmad Rizki', '1A', 'Jl. Merdeka No. 10', '081234567890', 'Budi Santoso', 'L', '2024'),
(2024001002, '2024001002', 'Siti Nurhaliza', '1A', 'Jl. Sudirman No. 20', '081234567891', 'Eko Prasetyo', 'P', '2024'),
(2024001003, '2024001003', 'Muhammad Fajar', '1B', 'Jl. Diponegoro No. 30', '081234567892', 'Sri Wahyuni', 'L', '2024')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- =====================================================
-- Insert Data Pembayaran Contoh
-- =====================================================
INSERT INTO payments (student_nisn, jenis_pembayaran, nominal, tanggal_pembayaran, status, keterangan, petugas) VALUES
('2024001001', 'SPP Bulanan', 150000.00, '2024-01-15', 'lunas', 'Pembayaran SPP Januari 2024', 'Operator Keuangan'),
('2024001001', 'Uang Buku', 200000.00, '2024-01-15', 'lunas', 'Pembayaran uang buku tahun ajaran 2024', 'Operator Keuangan'),
('2024001002', 'SPP Bulanan', 150000.00, '2024-01-16', 'lunas', 'Pembayaran SPP Januari 2024', 'Operator Keuangan')
ON DUPLICATE KEY UPDATE created_at = CURRENT_TIMESTAMP;

-- =====================================================
-- Buat User Database Khusus (OPSIONAL untuk keamanan)
-- =====================================================
-- CREATE USER IF NOT EXISTS 'sipesda_user'@'localhost' IDENTIFIED BY 'sipesda_password123';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON sipesda_sekolah.* TO 'sipesda_user'@'localhost';
-- FLUSH PRIVILEGES;

-- =====================================================
-- View untuk Report (OPSIONAL)
-- =====================================================
CREATE OR REPLACE VIEW v_student_payments AS
SELECT 
    s.nisn,
    s.nama,
    s.kelas,
    s.angkatan,
    COUNT(p.id) as total_transaksi,
    COALESCE(SUM(p.nominal), 0) as total_pembayaran,
    MAX(p.tanggal_pembayaran) as pembayaran_terakhir
FROM students s
LEFT JOIN payments p ON s.nisn = p.student_nisn
GROUP BY s.nisn, s.nama, s.kelas, s.angkatan;

-- =====================================================
-- Show Tables dan Status
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

-- =====================================================
-- Informasi Penting
-- =====================================================
SELECT 
    'Database sipesda_sekolah berhasil dibuat!' as status,
    'Username admin: admin, Password: admin123' as login_info,
    'Jangan lupa ganti password default!' as peringatan;

-- =====================================================
-- END OF SCRIPT
-- ===================================================== 