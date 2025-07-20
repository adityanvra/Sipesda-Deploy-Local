-- Simple SIPESDA Permissions Fix
-- This script adds missing permissions without causing foreign key errors

USE sipesda;

-- First, let's see what users exist
SELECT 'EXISTING USERS:' as message;
SELECT id, username, role FROM users ORDER BY id;

-- Add admin permissions (only if user exists and permission doesn't exist)
INSERT IGNORE INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 1, 'users', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 1);

INSERT IGNORE INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 1, 'students', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 1);

INSERT IGNORE INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 1, 'payments', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 1);

INSERT IGNORE INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 1, 'payment_types', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 1);

-- Add operator permissions (only if user exists and permission doesn't exist)
INSERT IGNORE INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 2, 'students', 1, 0, 0, 0 WHERE EXISTS (SELECT 1 FROM users WHERE id = 2);

INSERT IGNORE INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 2, 'payments', 1, 1, 1, 0 WHERE EXISTS (SELECT 1 FROM users WHERE id = 2);

INSERT IGNORE INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 2, 'payment_types', 1, 0, 0, 0 WHERE EXISTS (SELECT 1 FROM users WHERE id = 2);

-- Update existing permissions to correct values
UPDATE user_permissions SET can_delete = 1 WHERE user_id = 1 AND permission = 'payments';
UPDATE user_permissions SET can_delete = 1 WHERE user_id = 3 AND permission = 'payments';
UPDATE user_permissions SET can_delete = 1 WHERE user_id = 5 AND permission = 'payments';

-- Show final permissions
SELECT 'FINAL PERMISSIONS:' as message;
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
ORDER BY u.username, up.permission; 