@echo off
title SIPESDA Menu
color 0A

:menu
cls
echo.
echo ========================================
echo         SIPESDA APPLICATION MENU
echo     Sistem Pembayaran Sekolah Dasar
echo ========================================
echo.
echo [1] Start Application
echo [2] Stop All Services
echo [3] Check Status
echo [4] Show Login Credentials
echo [5] Open Browser
echo [6] Exit
echo.
echo ========================================
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto start_app
if "%choice%"=="2" goto stop_all
if "%choice%"=="3" goto check_status
if "%choice%"=="4" goto show_credentials
if "%choice%"=="5" goto open_browser
if "%choice%"=="6" goto exit_menu

echo Invalid choice. Please enter a number between 1-6.
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
echo ADMIN USERS:
echo    Username: admin     Password: admin123
echo    Username: admin2    Password: admin123
echo    Username: superadmin Password: admin123
echo.
echo OPERATOR USERS:
echo    Username: operator  Password: operator123
echo    Username: operator2 Password: operator123
echo.
echo APPLICATION URLs:
echo    Backend:  http://localhost:5000
echo    Frontend: http://localhost:3000
echo    API Health: http://localhost:5000/api/health
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
echo Thank you for using SIPESDA!
echo.
exit /b 