-- Safe SIPESDA Permissions Fix
-- This script safely updates permissions without foreign key constraint errors

USE sipesda;

-- Step 1: Check existing users
SELECT 'STEP 1: Checking existing users...' as step;
SELECT id, username, role FROM users ORDER BY id;

-- Step 2: Clear existing permissions
SELECT 'STEP 2: Clearing existing permissions...' as step;
DELETE FROM user_permissions;

-- Step 3: Insert permissions for admin users (only if they exist)
SELECT 'STEP 3: Adding admin permissions...' as step;

-- Admin user (id=1) - if exists
INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 1, 'users', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 1 AND role = 'admin');

INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 1, 'students', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 1 AND role = 'admin');

INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 1, 'payments', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 1 AND role = 'admin');

INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 1, 'payment_types', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 1 AND role = 'admin');

-- Admin2 user (id=3) - if exists
INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 3, 'users', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 3 AND role = 'admin');

INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 3, 'students', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 3 AND role = 'admin');

INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 3, 'payments', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 3 AND role = 'admin');

INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 3, 'payment_types', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 3 AND role = 'admin');

-- Super Admin user (id=5) - if exists
INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 5, 'users', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 5 AND role = 'admin');

INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 5, 'students', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 5 AND role = 'admin');

INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 5, 'payments', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 5 AND role = 'admin');

INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 5, 'payment_types', 1, 1, 1, 1 WHERE EXISTS (SELECT 1 FROM users WHERE id = 5 AND role = 'admin');

-- Step 4: Insert permissions for operator users (only if they exist)
SELECT 'STEP 4: Adding operator permissions...' as step;

-- Operator user (id=2) - if exists
INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 2, 'students', 1, 0, 0, 0 WHERE EXISTS (SELECT 1 FROM users WHERE id = 2 AND role = 'operator');

INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 2, 'payments', 1, 1, 1, 0 WHERE EXISTS (SELECT 1 FROM users WHERE id = 2 AND role = 'operator');

INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 2, 'payment_types', 1, 0, 0, 0 WHERE EXISTS (SELECT 1 FROM users WHERE id = 2 AND role = 'operator');

-- Operator2 user (id=4) - if exists
INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 4, 'students', 1, 0, 0, 0 WHERE EXISTS (SELECT 1 FROM users WHERE id = 4 AND role = 'operator');

INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 4, 'payments', 1, 1, 1, 0 WHERE EXISTS (SELECT 1 FROM users WHERE id = 4 AND role = 'operator');

INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
SELECT 4, 'payment_types', 1, 0, 0, 0 WHERE EXISTS (SELECT 1 FROM users WHERE id = 4 AND role = 'operator');

-- Step 5: Verify results
SELECT 'STEP 5: Verifying permissions...' as step;

SELECT 'ADMIN PERMISSIONS:' as admin_permissions;
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

SELECT 'OPERATOR PERMISSIONS:' as operator_permissions;
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