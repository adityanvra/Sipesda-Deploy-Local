@echo off
title SIPESDA Backend Server
color 0A
echo.
echo ========================================
echo    SIPESDA Backend Server - Local
echo ========================================
echo.
echo Starting backend server...
echo Server akan berjalan di: http://localhost:5000
echo Tekan Ctrl+C untuk menghentikan server
echo.

cd backend
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

if not exist .env (
    echo.
    echo ERROR: File .env tidak ditemukan!
    echo Silakan buat file .env di folder backend dengan konfigurasi database
    echo Contoh isi file .env:
    echo.
    echo DB_HOST=localhost
    echo DB_USER=root
    echo DB_PASSWORD=admin123
    echo DB_NAME=sipesda_sekolah
    echo DB_PORT=3306
    echo PORT=5000
    echo NODE_ENV=development
    echo CORS_ORIGIN=http://localhost:3000
    echo.
    pause
    exit
)

npm start
pause 