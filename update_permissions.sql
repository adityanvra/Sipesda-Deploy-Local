-- Update SIPESDA Permissions
-- Run this script to fix permissions for admin and operator

USE sipesda;

-- First, let's check what users exist
SELECT 'EXISTING USERS:' as message;
SELECT id, username, role FROM users ORDER BY id;

-- Clear existing permissions
DELETE FROM user_permissions;

-- Insert correct permissions for admin (FULL ACCESS) - Only for existing users
INSERT INTO `user_permissions` (`user_id`, `permission`, `can_read`, `can_create`, `can_update`, `can_delete`) 
SELECT 1, 'users', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
UNION ALL
SELECT 1, 'students', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
UNION ALL
SELECT 1, 'payments', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)
UNION ALL
SELECT 1, 'payment_types', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 1)

UNION ALL

SELECT 3, 'users', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 3)
UNION ALL
SELECT 3, 'students', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 3)
UNION ALL
SELECT 3, 'payments', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 3)
UNION ALL
SELECT 3, 'payment_types', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 3)

UNION ALL

SELECT 5, 'users', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 5)
UNION ALL
SELECT 5, 'students', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 5)
UNION ALL
SELECT 5, 'payments', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 5)
UNION ALL
SELECT 5, 'payment_types', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 5);

-- Insert LIMITED permissions for operators - Only for existing users
INSERT INTO `user_permissions` (`user_id`, `permission`, `can_read`, `can_create`, `can_update`, `can_delete`) 
SELECT 2, 'students', 1, 0, 0, 0 WHERE EXISTS (SELECT 1 FROM users WHERE id = 2)
UNION ALL
SELECT 2, 'payments', 1, 1, 1, 0 WHERE EXISTS (SELECT 1 FROM users WHERE id = 2)
UNION ALL
SELECT 2, 'payment_types', 1, 0, 0, 0 WHERE EXISTS (SELECT 1 FROM users WHERE id = 2)

UNION ALL

SELECT 4, 'students', 1, 0, 0, 0 WHERE EXISTS (SELECT 1 FROM users WHERE id = 4)
UNION ALL
SELECT 4, 'payments', 1, 1, 1, 0 WHERE EXISTS (SELECT 1 FROM users WHERE id = 4)
UNION ALL
SELECT 4, 'payment_types', 1, 0, 0, 0 WHERE EXISTS (SELECT 1 FROM users WHERE id = 4);

-- Verify permissions
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

SELECT 'PERMISSIONS UPDATED SUCCESSFULLY!' as message; 