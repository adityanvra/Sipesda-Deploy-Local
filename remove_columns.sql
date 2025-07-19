-- Remove no_hp and last_login columns from users table
ALTER TABLE users DROP COLUMN IF EXISTS no_hp;
ALTER TABLE users DROP COLUMN IF EXISTS last_login;

-- Verify the changes
DESCRIBE users; 