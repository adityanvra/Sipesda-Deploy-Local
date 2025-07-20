-- Update SIPESDA Permissions
-- Run this script to fix permissions for admin and operator

USE sipesda;

-- Clear existing permissions
DELETE FROM user_permissions;

-- Insert correct permissions for admin (FULL ACCESS)
INSERT INTO `user_permissions` (`user_id`, `permission`, `can_read`, `can_create`, `can_update`, `can_delete`) VALUES
-- Admin 1 (admin) - FULL ACCESS
(1, 'users', 1, 1, 1, 1),
(1, 'students', 1, 1, 1, 1),
(1, 'payments', 1, 1, 1, 1),        -- Full access including delete
(1, 'payment_types', 1, 1, 1, 1),
-- Admin 2 (admin2) - FULL ACCESS
(3, 'users', 1, 1, 1, 1),
(3, 'students', 1, 1, 1, 1),
(3, 'payments', 1, 1, 1, 1),        -- Full access including delete
(3, 'payment_types', 1, 1, 1, 1),
-- Super Admin - FULL ACCESS
(5, 'users', 1, 1, 1, 1),
(5, 'students', 1, 1, 1, 1),
(5, 'payments', 1, 1, 1, 1),        -- Full access including delete
(5, 'payment_types', 1, 1, 1, 1);

-- Insert LIMITED permissions for operators
INSERT INTO `user_permissions` (`user_id`, `permission`, `can_read`, `can_create`, `can_update`, `can_delete`) VALUES
-- Operator 1 (operator) - LIMITED ACCESS
(2, 'students', 1, 0, 0, 0),        -- READ ONLY (tidak bisa tambah, edit, hapus siswa)
(2, 'payments', 1, 1, 1, 0),        -- CREATE/READ/UPDATE (tidak bisa delete payments)
(2, 'payment_types', 1, 0, 0, 0),   -- READ ONLY
-- Operator 2 (operator2) - LIMITED ACCESS
(4, 'students', 1, 0, 0, 0),        -- READ ONLY (tidak bisa tambah, edit, hapus siswa)
(4, 'payments', 1, 1, 1, 0),        -- CREATE/READ/UPDATE (tidak bisa delete payments)
(4, 'payment_types', 1, 0, 0, 0);   -- READ ONLY

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