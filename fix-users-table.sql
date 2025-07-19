-- =====================================================
-- Fix Users Table Structure - Remove aktif column
-- =====================================================

-- Drop existing users table if exists
DROP TABLE IF EXISTS users;

-- Create users table without aktif column
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

-- Insert default admin user
INSERT INTO users (username, password, nama_lengkap, role, email) VALUES
('admin', '$2b$10$rOmKy.9y4ZyS4EKDOTdQHOQSj/5rqQx0x6RXz1vQKFm0qE4QjB6pe', 'Administrator SIPESDA', 'admin', 'admin@sekolah.id'),
('operator', '$2b$10$rOmKy.9y4ZyS4EKDOTdQHOQSj/5rqQx0x6RXz1vQKFm0qE4QjB6pe', 'Operator Keuangan', 'operator', 'keuangan@sekolah.id')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Show table structure
DESCRIBE users;

-- Show sample data
SELECT id, username, nama_lengkap, role, email, created_at FROM users; 