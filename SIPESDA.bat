@echo off
title SIPESDA Application
color 0A

echo.
echo ========================================
echo         SIPESDA APPLICATION
echo     Sistem Pembayaran Sekolah Dasar
echo ========================================
echo.

echo 1. Stopping existing processes...
taskkill /f /im node.exe 2>nul
echo Done.

echo.
echo 2. Starting Backend Server...
cd backend
start "Backend" cmd /k "npm run dev"

echo.
echo 3. Waiting 5 seconds...
timeout /t 5 /nobreak > nul

echo.
echo 4. Starting Frontend Server...
cd ..\frontend
start "Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo         APPLICATION STARTED!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Login Credentials:
echo Admin: admin / admin123
echo Operator: operator / operator123
echo.
echo Press any key to open browser...
pause > nul

start http://localhost:3000

echo.
echo Browser opened! Application is ready.
echo.
pause 