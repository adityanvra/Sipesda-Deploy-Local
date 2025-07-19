@echo off
title SIPESDA Quick Setup - Local Deployment
color 0E
cls

echo.
echo =========================================================
echo         SIPESDA Quick Setup - Deployment Lokal
echo =========================================================
echo.
echo Script ini akan membantu setup SIPESDA untuk komputer sekolah
echo.
echo Persyaratan:
echo - Node.js sudah terinstall
echo - MySQL sudah terinstall dan berjalan
echo - Git sudah terinstall
echo.
echo TEKAN ENTER untuk melanjutkan atau Ctrl+C untuk batal...
pause >nul

echo.
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js tidak ditemukan! Download dari https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js detected
    node --version
)

echo.
echo [2/6] Checking MySQL installation...
mysql --version >nul 2>&1
if errorlevel 1 (
    echo ❌ MySQL tidak ditemukan! Pastikan MySQL sudah terinstall dan ada di PATH
    echo Atau akses MySQL melalui direktori installasi
    echo.
    set /p mysql_path="Masukkan path ke mysql.exe (atau tekan Enter untuk skip): "
    if not "%mysql_path%"=="" (
        set "PATH=%PATH%;%mysql_path%"
    )
) else (
    echo ✅ MySQL detected
    mysql --version
)

echo.
echo [3/6] Installing Backend Dependencies...
if exist backend (
    cd backend
    if not exist node_modules (
        echo Installing backend packages...
        npm install
        if errorlevel 1 (
            echo ❌ Error installing backend dependencies
            pause
            exit /b 1
        )
    ) else (
        echo ✅ Backend dependencies already installed
    )
    cd ..
) else (
    echo ❌ Backend folder not found!
    pause
    exit /b 1
)

echo.
echo [4/6] Installing Frontend Dependencies...
if exist frontend (
    cd frontend
    if not exist node_modules (
        echo Installing frontend packages...
        npm install
        if errorlevel 1 (
            echo ❌ Error installing frontend dependencies
            pause
            exit /b 1
        )
    ) else (
        echo ✅ Frontend dependencies already installed
    )
    cd ..
) else (
    echo ❌ Frontend folder not found!
    pause
    exit /b 1
)

echo.
echo [5/6] Database Configuration Setup...
if not exist backend\.env (
    echo Creating .env file for backend...
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
    echo ✅ .env file created in backend folder
    echo.
    echo ⚠️  PENTING: Edit file backend\.env dan isi DB_PASSWORD dengan password MySQL root Anda!
) else (
    echo ✅ .env file already exists
)

echo.
echo [6/6] Frontend Configuration...
if exist frontend\src\utils\database-local.ts (
    echo ✅ Local database configuration available
    echo ⚠️  Untuk menggunakan konfigurasi lokal, copy isi file:
    echo    frontend\src\utils\database-local.ts 
    echo    ke file: frontend\src\utils\database.ts
) else (
    echo ❌ Local database configuration not found
)

echo.
echo =========================================================
echo                    SETUP SELESAI!
echo =========================================================
echo.
echo Langkah selanjutnya:
echo.
echo 1. Edit file backend\.env dan isi password MySQL
echo.
echo 2. Setup database dengan menjalankan:
echo    mysql -u root -p ^< database-setup-lokal.sql
echo.
echo 3. Copy konfigurasi database lokal:
echo    copy frontend\src\utils\database-local.ts frontend\src\utils\database.ts
echo.
echo 4. Start aplikasi:
echo    - Backend: Jalankan start-backend-local.bat
echo    - Frontend: Jalankan start-frontend-local.bat
echo.
echo File bantuan:
echo - SETUP_LOKAL_SEKOLAH.md: Panduan lengkap
echo - database-setup-lokal.sql: Script database
echo.
echo =========================================================

echo.
echo Apakah Anda ingin membuka file .env untuk edit? (y/n)
set /p edit_env="Enter pilihan: "
if /i "%edit_env%"=="y" (
    if exist backend\.env (
        notepad backend\.env
    )
)

echo.
echo Apakah Anda ingin setup database sekarang? (y/n)
set /p setup_db="Enter pilihan: "
if /i "%setup_db%"=="y" (
    echo.
    echo Masukkan password MySQL root:
    mysql -u root -p < database-setup-lokal.sql
    if errorlevel 1 (
        echo ❌ Error setting up database
        echo Silakan jalankan database setup manual dengan:
        echo mysql -u root -p ^< database-setup-lokal.sql
    ) else (
        echo ✅ Database setup completed!
    )
)

echo.
echo Tekan Enter untuk selesai...
pause >nul 