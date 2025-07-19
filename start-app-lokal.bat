@echo off
title SIPESDA Local Deployment - Complete Setup
color 0C
cls

echo.
echo =========================================================
echo         SIPESDA Local Deployment - Complete Setup
echo =========================================================
echo.
echo Script ini akan menjalankan SIPESDA untuk deployment lokal
echo.
echo Pastikan:
echo - MySQL sudah berjalan
echo - File backend\.env sudah dikonfigurasi
echo - Database sudah dibuat dengan database-setup-lokal.sql
echo.

echo Apakah Anda ingin menjalankan setup otomatis? (y/n)
set /p auto_setup="Enter pilihan: "

if /i "%auto_setup%"=="y" (
    echo.
    echo [1/3] Checking and creating .env file...
    if not exist backend\.env (
        echo Creating .env file...
        (
            echo # SIPESDA Local Database Configuration
            echo DB_HOST=localhost
            echo DB_USER=root
            echo DB_PASSWORD=
            echo DB_NAME=sipesda_sekolah
            echo DB_PORT=3306
            echo PORT=5000
            echo NODE_ENV=development
            echo CORS_ORIGIN=http://localhost:3000
        ) > backend\.env
        echo ✅ .env file created
        echo ⚠️  PENTING: Edit backend\.env dan isi DB_PASSWORD!
        echo.
        echo Apakah Anda ingin edit .env sekarang? (y/n)
        set /p edit_now="Enter pilihan: "
        if /i "%edit_now%"=="y" (
            notepad backend\.env
        )
    ) else (
        echo ✅ .env file already exists
    )
    
    echo.
    echo [2/3] Installing dependencies...
    if not exist backend\node_modules (
        echo Installing backend dependencies...
        cd backend
        npm install
        cd ..
    )
    
    if not exist frontend\node_modules (
        echo Installing frontend dependencies...
        cd frontend
        npm install
        cd ..
    )
    
    echo.
    echo [3/3] Database setup reminder...
    echo ⚠️  Pastikan database sudah dibuat dengan menjalankan:
    echo    mysql -u root -p ^< database-setup-lokal.sql
    echo.
)

echo.
echo =========================================================
echo              STARTING SIPESDA APPLICATION
echo =========================================================
echo.
echo Backend akan berjalan di: http://localhost:5000
echo Frontend akan berjalan di: http://localhost:3000
echo.
echo Tekan Ctrl+C di salah satu window untuk menghentikan
echo.

echo Starting Backend Server...
start "SIPESDA Backend" cmd /k "cd backend && npm start"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Application...
start "SIPESDA Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================================
echo                    APLIKASI BERJALAN!
echo =========================================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Login default:
echo Username: admin
echo Password: admin123
echo.
echo Tekan Enter untuk menutup script ini...
pause >nul 