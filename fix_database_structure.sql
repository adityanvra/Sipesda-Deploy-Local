-- Fix Database Structure Issues
-- Railway Database

-- 1. Fix duplicate created_at column in students table
ALTER TABLE students DROP COLUMN IF EXISTS created_at;
ALTER TABLE students ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. Ensure proper primary key structure
-- Students table should have NISN as primary key, not ID
ALTER TABLE students DROP PRIMARY KEY;
ALTER TABLE students ADD PRIMARY KEY (nisn);

-- 3. Make ID column auto-increment and remove it from primary key
ALTER TABLE students MODIFY COLUMN id BIGINT AUTO_INCREMENT;
ALTER TABLE students ADD UNIQUE KEY unique_id (id);

-- 4. Fix foreign key constraint in payments table
-- Drop existing foreign key if it exists
ALTER TABLE payments DROP FOREIGN KEY IF EXISTS payments_ibfk_1;

-- Add proper foreign key constraint
ALTER TABLE payments ADD CONSTRAINT fk_payments_student_nisn 
FOREIGN KEY (student_nisn) REFERENCES students(nisn) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- 5. Remove duplicate indexes
DROP INDEX IF EXISTS idx_nisn ON students;

-- 6. Ensure proper data types and constraints
ALTER TABLE students MODIFY COLUMN nisn VARCHAR(20) NOT NULL;
ALTER TABLE students MODIFY COLUMN nama VARCHAR(100) NOT NULL;
ALTER TABLE students MODIFY COLUMN kelas VARCHAR(10) NOT NULL;
ALTER TABLE students MODIFY COLUMN nama_wali VARCHAR(100) NOT NULL;
ALTER TABLE students MODIFY COLUMN jenis_kelamin ENUM('L', 'P') NOT NULL DEFAULT 'L';
ALTER TABLE students MODIFY COLUMN angkatan VARCHAR(4) NOT NULL;

-- 7. Add proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_kelas ON students(kelas);
CREATE INDEX IF NOT EXISTS idx_students_angkatan ON students(angkatan);
CREATE INDEX IF NOT EXISTS idx_students_nama ON students(nama);

-- 8. Verify the structure
DESCRIBE students;
DESCRIBE payments;

-- 9. Show foreign key constraints
SELECT 
  TABLE_NAME,
  COLUMN_NAME,
  CONSTRAINT_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE REFERENCED_TABLE_SCHEMA = 'railway' 
AND REFERENCED_TABLE_NAME IS NOT NULL; 