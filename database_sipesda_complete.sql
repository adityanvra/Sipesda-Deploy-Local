-- =====================================================
-- SIPESDA Database - Complete Version for Laragon
-- =====================================================
-- File: database_sipesda_complete.sql
-- Description: Complete database structure with correct permissions
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS `sipesda` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use database
USE `sipesda`;

-- Drop tables if exist (for clean import)
DROP TABLE IF EXISTS `user_sessions`;
DROP TABLE IF EXISTS `user_permissions`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `payment_types`;
DROP TABLE IF EXISTS `users`;

-- =====================================================
-- TABLE: users
-- =====================================================
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','operator') NOT NULL DEFAULT 'operator',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: user_permissions
-- =====================================================
CREATE TABLE `user_permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `permission` varchar(50) NOT NULL,
  `can_read` tinyint(1) NOT NULL DEFAULT 0,
  `can_create` tinyint(1) NOT NULL DEFAULT 0,
  `can_update` tinyint(1) NOT NULL DEFAULT 0,
  `can_delete` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_permission` (`user_id`, `permission`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: user_sessions
-- =====================================================
CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `remember_me` tinyint(1) NOT NULL DEFAULT 0,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_activity` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_token` (`session_token`),
  KEY `user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: students
-- =====================================================
CREATE TABLE `students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nisn` varchar(20) NOT NULL,
  `nama` varchar(100) NOT NULL,
  `kelas` varchar(10) NOT NULL DEFAULT '1A',
  `alamat` text,
  `no_hp` varchar(15),
  `nama_wali` varchar(100),
  `jenis_kelamin` enum('L','P') NOT NULL DEFAULT 'L',
  `angkatan` varchar(4) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nisn` (`nisn`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: payment_types
-- =====================================================
CREATE TABLE `payment_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `nominal` decimal(10,2) NOT NULL,
  `periode` varchar(50) NOT NULL,
  `aktif` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: payments
-- =====================================================
CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) NOT NULL,
  `student_nisn` varchar(20) NOT NULL,
  `jenis_pembayaran` varchar(100) NOT NULL,
  `nominal` decimal(10,2) NOT NULL,
  `tanggal_pembayaran` date NOT NULL,
  `status` enum('lunas','belum_lunas','cicilan') NOT NULL DEFAULT 'lunas',
  `keterangan` text,
  `catatan` text,
  `petugas` varchar(100),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_student_nisn` (`student_nisn`),
  KEY `idx_student_id` (`student_id`),
  FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`student_nisn`) REFERENCES `students` (`nisn`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert default users
INSERT INTO `users` (`username`, `password`, `role`) VALUES
('admin', 'admin123', 'admin'),
('operator', 'operator123', 'operator'),
('admin2', 'admin123', 'admin'),
('operator2', 'operator123', 'operator'),
('superadmin', 'admin123', 'admin');

-- Insert default permissions for admin (FULL ACCESS - CORRECTED)
INSERT INTO `user_permissions` (`user_id`, `permission`, `can_read`, `can_create`, `can_update`, `can_delete`) VALUES
-- Admin 1 (admin) - FULL ACCESS
(1, 'users', 1, 1, 1, 1),
(1, 'students', 1, 1, 1, 1),
(1, 'payments', 1, 1, 1, 1),
(1, 'payment_types', 1, 1, 1, 1),
-- Admin 2 (admin2) - FULL ACCESS
(3, 'users', 1, 1, 1, 1),
(3, 'students', 1, 1, 1, 1),
(3, 'payments', 1, 1, 1, 1),
(3, 'payment_types', 1, 1, 1, 1),
-- Super Admin - FULL ACCESS
(5, 'users', 1, 1, 1, 1),
(5, 'students', 1, 1, 1, 1),
(5, 'payments', 1, 1, 1, 1),
(5, 'payment_types', 1, 1, 1, 1);

-- Insert LIMITED permissions for operators (CORRECTED)
INSERT INTO `user_permissions` (`user_id`, `permission`, `can_read`, `can_create`, `can_update`, `can_delete`) VALUES
-- Operator 1 (operator) - LIMITED ACCESS
(2, 'students', 1, 0, 0, 0),        -- READ ONLY
(2, 'payments', 1, 1, 1, 0),        -- CREATE/READ/UPDATE (no DELETE)
(2, 'payment_types', 1, 0, 0, 0),   -- READ ONLY
-- Operator 2 (operator2) - LIMITED ACCESS
(4, 'students', 1, 0, 0, 0),        -- READ ONLY
(4, 'payments', 1, 1, 1, 0),        -- CREATE/READ/UPDATE (no DELETE)
(4, 'payment_types', 1, 0, 0, 0);   -- READ ONLY

-- Insert sample payment types
INSERT INTO `payment_types` (`nama`, `nominal`, `periode`, `aktif`) VALUES
('SPP Bulanan', 500000.00, 'Bulanan', 1),
('Uang Gedung', 2000000.00, 'Sekali Bayar', 1),
('Uang Seragam', 750000.00, 'Sekali Bayar', 1),
('Uang Buku', 300000.00, 'Semester', 1),
('Uang Kegiatan', 250000.00, 'Semester', 1);

-- Insert sample students
INSERT INTO `students` (`nisn`, `nama`, `kelas`, `alamat`, `no_hp`, `nama_wali`, `jenis_kelamin`, `angkatan`) VALUES
('1234567890', 'Ahmad Fadillah', '10A', 'Jl. Merdeka No. 123, Jakarta', '081234567890', 'Budi Santoso', 'L', '2024'),
('1234567891', 'Siti Nurhaliza', '10A', 'Jl. Sudirman No. 456, Jakarta', '081234567891', 'Ahmad Hidayat', 'P', '2024'),
('1234567892', 'Muhammad Rizki', '10B', 'Jl. Thamrin No. 789, Jakarta', '081234567892', 'Siti Aminah', 'L', '2024'),
('1234567893', 'Dewi Sartika', '10B', 'Jl. Gatot Subroto No. 321, Jakarta', '081234567893', 'Raden Mas', 'P', '2024'),
('1234567894', 'Budi Prasetyo', '11A', 'Jl. Hayam Wuruk No. 654, Jakarta', '081234567894', 'Sri Wahyuni', 'L', '2023');

-- Insert sample payments
INSERT INTO `payments` (`student_id`, `student_nisn`, `jenis_pembayaran`, `nominal`, `tanggal_pembayaran`, `status`, `keterangan`, `petugas`) VALUES
(1, '1234567890', 'SPP Bulanan', 500000.00, '2024-01-15', 'lunas', 'Pembayaran SPP Januari 2024', 'admin'),
(1, '1234567890', 'Uang Gedung', 2000000.00, '2024-01-20', 'lunas', 'Pembayaran uang gedung', 'admin'),
(2, '1234567891', 'SPP Bulanan', 500000.00, '2024-01-16', 'lunas', 'Pembayaran SPP Januari 2024', 'operator'),
(2, '1234567891', 'Uang Seragam', 750000.00, '2024-01-21', 'lunas', 'Pembayaran uang seragam', 'operator'),
(3, '1234567892', 'SPP Bulanan', 500000.00, '2024-01-17', 'lunas', 'Pembayaran SPP Januari 2024', 'admin');

-- =====================================================
-- VERIFY PERMISSIONS
-- =====================================================

SELECT 'DATABASE SIPESDA BERHASIL DIBUAT!' as message;

SELECT 'ADMIN PERMISSIONS (FULL ACCESS):' as admin_permissions;
SELECT 
  u.username,
  u.role,
  up.permission,
  up.can_read,
  up.can_create,
  up.can_update,
  up.can_delete
FROM users u
JOIN user_permissions up ON u.id = up.user_id
WHERE u.role = 'admin'
ORDER BY u.username, up.permission;

SELECT 'OPERATOR PERMISSIONS (LIMITED ACCESS):' as operator_permissions;
SELECT 
  u.username,
  u.role,
  up.permission,
  up.can_read,
  up.can_create,
  up.can_update,
  up.can_delete
FROM users u
JOIN user_permissions up ON u.id = up.user_id
WHERE u.role = 'operator'
ORDER BY u.username, up.permission;

-- =====================================================
-- LOGIN CREDENTIALS
-- =====================================================
SELECT 'LOGIN CREDENTIALS:' as credentials;
SELECT 'Admin: admin / admin123' as admin_login;
SELECT 'Admin: admin2 / admin123' as admin2_login;
SELECT 'Admin: superadmin / admin123' as superadmin_login;
SELECT 'Operator: operator / operator123' as operator_login;
SELECT 'Operator: operator2 / operator123' as operator2_login;

-- =====================================================
-- PERMISSION SUMMARY
-- =====================================================
SELECT 'PERMISSION SUMMARY:' as summary;
SELECT 
  'ADMIN' as role,
  'Full access to all features (CREATE/READ/UPDATE/DELETE)' as description
UNION ALL
SELECT 
  'OPERATOR' as role,
  'Students: READ ONLY | Payments: CREATE/READ/UPDATE (no DELETE) | Payment Types: READ ONLY' as description; 