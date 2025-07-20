@echo off
title SIPESDA Database Setup
color 0A

echo.
echo ========================================
echo         SIPESDA DATABASE SETUP
echo     Sistem Pembayaran Sekolah Dasar
echo ========================================
echo.

echo 1. Pastikan Laragon sudah berjalan
echo 2. Pastikan MySQL sudah aktif
echo 3. Buka phpMyAdmin: http://localhost/phpmyadmin
echo 4. Import file: database_sipesda_complete.sql
echo.
echo File SQL yang digunakan: database_sipesda_complete.sql
echo.

echo ========================================
echo         INSTRUKSI SETUP
echo ========================================
echo.
echo 1. Buka browser dan akses: http://localhost/phpmyadmin
echo 2. Login dengan username dan password Laragon
echo 3. Klik tab "Import"
echo 4. Klik "Choose File" dan pilih: database_sipesda_complete.sql
echo 5. Klik "Go" untuk menjalankan import
echo 6. Tunggu sampai proses selesai
echo.

echo ========================================
echo         LOGIN CREDENTIALS
echo ========================================
echo.
echo ADMIN USERS (FULL ACCESS):
echo    Username: admin     Password: admin123
echo    Username: admin2    Password: admin123
echo    Username: superadmin Password: admin123
echo.
echo OPERATOR USERS (LIMITED ACCESS):
echo    Username: operator  Password: operator123
echo    Username: operator2 Password: operator123
echo.

echo ========================================
echo         PERMISSION SUMMARY
echo ========================================
echo.
echo ADMIN:
echo    - Full access to all features
echo    - Can CREATE, READ, UPDATE, DELETE students
echo    - Can CREATE, READ, UPDATE, DELETE payments
echo    - Can CREATE, READ, UPDATE, DELETE payment types
echo.
echo OPERATOR:
echo    - Students: READ ONLY (cannot create/update/delete)
echo    - Payments: CREATE, READ, UPDATE (cannot delete)
echo    - Payment Types: READ ONLY (cannot create/update/delete)
echo.

echo ========================================
echo         SETUP COMPLETE
echo ========================================
echo.
echo Setelah import selesai, jalankan aplikasi dengan:
echo SIPESDA.bat
echo.
pause 