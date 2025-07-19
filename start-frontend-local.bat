@echo off
title SIPESDA Frontend Application
color 0B
echo.
echo ========================================
echo   SIPESDA Frontend Application - Local
echo ========================================
echo.
echo Starting frontend application...
echo Frontend akan berjalan di: http://localhost:3000
echo Tekan Ctrl+C untuk menghentikan aplikasi
echo.

cd frontend
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

echo Checking database configuration...
findstr "localhost:5000" src\utils\database.ts >nul
if errorlevel 1 (
    echo.
    echo WARNING: Database URL mungkin belum dikonfigurasi untuk lokal!
    echo Pastikan file frontend/src/utils/database.ts menggunakan:
    echo const API_BASE_URL = 'http://localhost:5000/api';
    echo.
    echo Tekan Enter untuk melanjutkan atau Ctrl+C untuk batal...
    pause >nul
)

echo.
echo Starting development server...
npm run dev
pause 