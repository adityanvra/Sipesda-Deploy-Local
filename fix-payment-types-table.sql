-- =====================================================
-- Fix Payment Types Table Structure - Remove aktif column
-- =====================================================

-- Drop existing payment_types table if exists
DROP TABLE IF EXISTS payment_types;

-- Create payment_types table without aktif column
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

-- Insert default payment types
INSERT INTO payment_types (nama, nominal, periode) VALUES
('SPP Bulanan', 150000.00, 'Bulanan'),
('Uang Gedung', 500000.00, 'Tahunan'),
('Uang Seragam', 300000.00, 'Tahunan'),
('Uang Buku', 200000.00, 'Tahunan'),
('Uang Kegiatan', 100000.00, 'Semester'),
('Uang Praktikum', 75000.00, 'Semester'),
('Dana Sosial', 50000.00, 'Bulanan')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;

-- Show table structure
DESCRIBE payment_types;

-- Show sample data
SELECT id, nama, nominal, periode, created_at FROM payment_types; 