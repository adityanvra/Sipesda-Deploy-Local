@echo off
title SIPESDA Full Manager
color 0A

:menu
cls
echo.
echo ========================================
echo         SIPESDA FULL MANAGER
echo     Sistem Pembayaran Sekolah Dasar
echo ========================================
echo.
echo APPLICATION MANAGEMENT
echo [1] Start Application
echo [2] Stop All Services
echo [3] Restart Application
echo.
echo DATABASE MANAGEMENT
echo [4] Setup Database (First Time)
echo [5] Reset Database (Clear All Data)
echo [6] Check Database Status
echo.
echo SYSTEM INFORMATION
echo [7] Check Application Status
echo [8] Show Login Credentials
echo [9] Open Browser
echo [10] Exit
echo.
echo ========================================
echo.

set /p choice="Enter your choice (1-10): "

if "%choice%"=="1" goto start_app
if "%choice%"=="2" goto stop_all
if "%choice%"=="3" goto restart_app
if "%choice%"=="4" goto setup_database
if "%choice%"=="5" goto reset_database
if "%choice%"=="6" goto check_database
if "%choice%"=="7" goto check_status
if "%choice%"=="8" goto show_credentials
if "%choice%"=="9" goto open_browser
if "%choice%"=="10" goto exit_menu

echo Invalid choice. Please enter a number between 1-10.
timeout /t 2 /nobreak > nul
goto menu

:start_app
echo.
echo ========================================
echo         STARTING APPLICATION
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
pause
goto menu

:stop_all
echo.
echo ========================================
echo         STOPPING ALL SERVICES
echo ========================================
echo.
echo Stopping all Node.js processes...
taskkill /f /im node.exe 2>nul
echo All Node.js processes stopped
echo.
pause
goto menu

:restart_app
echo.
echo ========================================
echo         RESTARTING APPLICATION
echo ========================================
echo.
echo Restarting application...
taskkill /f /im node.exe 2>nul
timeout /t 3 /nobreak > nul
goto start_app

:setup_database
echo.
echo ========================================
echo         SETUP DATABASE
echo ========================================
echo.
echo INSTRUCTIONS:
echo 1. Open Laragon and start MySQL
echo 2. Open phpMyAdmin: http://localhost/phpmyadmin
echo 3. Create database named "sipesda"
echo 4. Import file: database_sipesda_complete.sql
echo.
echo File SQL: database_sipesda_complete.sql
echo.
echo This file includes:
echo - Complete database structure
echo - Correct admin permissions (FULL ACCESS)
echo - Correct operator permissions (LIMITED ACCESS)
echo - Sample data
echo.
echo Press any key to open phpMyAdmin...
pause > nul
start http://localhost/phpmyadmin
echo.
echo phpMyAdmin opened! Please import database_sipesda_complete.sql
echo.
pause
goto menu

:reset_database
echo.
echo ========================================
echo         RESET DATABASE
echo ========================================
echo.
echo WARNING: This will reset the database!
echo All data will be lost!
echo.
set /p confirm="Are you sure? (y/N): "
if /i not "%confirm%"=="y" (
    echo Cancelled.
    pause
    goto menu
)

echo.
echo 1. Stopping servers...
taskkill /f /im node.exe 2>nul
echo Servers stopped

echo.
echo 2. Please manually:
echo    - Drop database 'sipesda' in phpMyAdmin
echo    - Import database_sipesda_complete.sql
echo    - Clear browser data
echo.
pause
goto menu

:check_database
echo.
echo ========================================
echo         CHECKING DATABASE
echo ========================================
echo.
echo Checking MySQL connection...
netstat -ano | findstr :3306 > nul
if %errorlevel% equ 0 (
    echo MySQL is running on port 3306
) else (
    echo MySQL is not running
    echo Please start Laragon MySQL
)

echo.
echo Testing API connection...
curl -s http://localhost:5000/api/health > nul
if %errorlevel% equ 0 (
    echo API is responding
    echo Database connection is working
) else (
    echo API is not responding
    echo Please check database connection
)

echo.
pause
goto menu

:check_status
echo.
echo ========================================
echo         CHECKING STATUS
echo ========================================
echo.
echo Checking MySQL...
netstat -ano | findstr :3306 > nul
if %errorlevel% equ 0 (
    echo MySQL is running on port 3306
) else (
    echo MySQL is not running
)

echo.
echo Checking Backend...
netstat -ano | findstr :5000 > nul
if %errorlevel% equ 0 (
    echo Backend is running on port 5000
) else (
    echo Backend is not running
)

echo.
echo Checking Frontend...
netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    echo Frontend is running on port 3000
) else (
    echo Frontend is not running
)

echo.
pause
goto menu

:show_credentials
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
echo APPLICATION URLs:
echo    Backend:  http://localhost:5000
echo    Frontend: http://localhost:3000
echo    API Health: http://localhost:5000/api/health
echo.
echo PERMISSION SUMMARY:
echo ADMIN: Full access (CREATE/READ/UPDATE/DELETE all)
echo OPERATOR: Students(READ), Payments(CRU), Types(READ)
echo.
pause
goto menu

:open_browser
echo.
echo ========================================
echo         OPENING BROWSER
echo ========================================
echo.
echo Opening application in browser...
start http://localhost:3000
echo.
echo Browser opened!
echo.
pause
goto menu

:exit_menu
echo.
echo Thank you for using SIPESDA Full Manager!
echo.
exit /b 