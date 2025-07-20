# SIPESDA Foreign Key Constraint Fix Guide

## 🔍 **MASALAH YANG DITEMUKAN**

Error: `#1452 - Cannot add or update a child row: a foreign key constraint fails`

**Penyebab:** Script SQL mencoba menambahkan permissions untuk user ID yang tidak ada di tabel `users`.

## ✅ **SOLUSI**

### **Opsi 1: Gunakan Script Aman (Recommended)**

Jalankan file `simple_fix_permissions.sql` di phpMyAdmin:

1. Buka phpMyAdmin
2. Pilih database `sipesda`
3. Klik tab "SQL"
4. Copy dan paste isi file `simple_fix_permissions.sql`
5. Klik "Go"

### **Opsi 2: Manual Fix**

Jika script di atas masih error, lakukan langkah manual:

#### **Step 1: Cek User yang Ada**
```sql
USE sipesda;
SELECT id, username, role FROM users ORDER BY id;
```

#### **Step 2: Cek Permissions yang Ada**
```sql
SELECT 
  u.username,
  u.role,
  up.permission,
  up.can_read,
  up.can_create,
  up.can_update,
  up.can_delete
FROM users u
LEFT JOIN user_permissions up ON u.id = up.user_id
ORDER BY u.username, up.permission;
```

#### **Step 3: Tambah Permissions Satu per Satu**

**Untuk Admin (jika user ID 1 ada):**
```sql
INSERT IGNORE INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
VALUES (1, 'users', 1, 1, 1, 1);

INSERT IGNORE INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
VALUES (1, 'students', 1, 1, 1, 1);

INSERT IGNORE INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
VALUES (1, 'payments', 1, 1, 1, 1);

INSERT IGNORE INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
VALUES (1, 'payment_types', 1, 1, 1, 1);
```

**Untuk Operator (jika user ID 2 ada):**
```sql
INSERT IGNORE INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
VALUES (2, 'students', 1, 0, 0, 0);

INSERT IGNORE INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
VALUES (2, 'payments', 1, 1, 1, 0);

INSERT IGNORE INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete)
VALUES (2, 'payment_types', 1, 0, 0, 0);
```

#### **Step 4: Update Permissions yang Sudah Ada**
```sql
-- Update admin payments delete permission
UPDATE user_permissions SET can_delete = 1 WHERE user_id = 1 AND permission = 'payments';

-- Update operator students permissions (read only)
UPDATE user_permissions SET can_create = 0, can_update = 0, can_delete = 0 
WHERE user_id = 2 AND permission = 'students';
```

### **Opsi 3: Reset Database (Jika Masih Bermasalah)**

Jika masih ada masalah, reset database dengan file lengkap:

1. Drop database `sipesda`
2. Import file `database_sipesda_complete.sql`
3. Database akan dibuat ulang dengan permissions yang benar

## 🧪 **VERIFIKASI**

Setelah menjalankan script, verifikasi dengan query:

```sql
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
```

## 🎯 **HASIL YANG DIHARAPKAN**

### **Admin Permissions:**
- Users: ✅ Create, Read, Update, Delete
- Students: ✅ Create, Read, Update, Delete
- Payments: ✅ Create, Read, Update, Delete
- Payment Types: ✅ Create, Read, Update, Delete

### **Operator Permissions:**
- Students: ✅ Read Only
- Payments: ✅ Create, Read, Update (No Delete)
- Payment Types: ✅ Read Only

## 🔧 **TROUBLESHOOTING**

### **Jika masih error foreign key:**

1. **Cek struktur tabel:**
```sql
DESCRIBE users;
DESCRIBE user_permissions;
```

2. **Cek foreign key constraints:**
```sql
SHOW CREATE TABLE user_permissions;
```

3. **Disable foreign key checks sementara:**
```sql
SET FOREIGN_KEY_CHECKS = 0;
-- Jalankan script permissions
SET FOREIGN_KEY_CHECKS = 1;
```

## 📞 **SUPPORT**

Jika masih mengalami masalah, coba:
1. Jalankan script `simple_fix_permissions.sql`
2. Jika masih error, gunakan opsi manual
3. Jika masih bermasalah, reset database dengan file lengkap 