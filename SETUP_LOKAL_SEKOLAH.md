# 🏫 Setup SIPESDA untuk Komputer Sekolah (Deployment Lokal)

## 📋 Persyaratan Sistem

### Software yang Dibutuhkan:
- **Node.js** versi 16+ ([Download](https://nodejs.org/))
- **MySQL** versi 8.0+ ([Download](https://dev.mysql.com/downloads/mysql/))
- **Git** ([Download](https://git-scm.com/))
- **Web Browser** (Chrome, Firefox, Edge)

### Spesifikasi Minimum:
- RAM: 4GB
- Storage: 2GB free space
- OS: Windows 10/11, macOS, atau Linux

## 🚀 Langkah-langkah Setup

### 1. Install Software Pendukung

#### Install Node.js:
1. Download dari https://nodejs.org/
2. Install dengan semua opsi default
3. Buka Command Prompt/Terminal, test dengan:
```bash
node --version
npm --version
```

#### Install MySQL:
1. Download MySQL Community Server
2. Install dengan password root yang mudah diingat (misal: `admin123`)
3. Catat username: `root` dan password yang dibuat

### 2. Clone Repository

```bash
git clone https://github.com/adityanvra/SIPESDA-DEPLOY.git
cd SIPESDA-DEPLOY
```

### 3. Setup Database MySQL

#### Buat Database:
```sql
-- Login ke MySQL sebagai root
mysql -u root -p

-- Buat database
CREATE DATABASE sipesda_sekolah CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Buat user khusus (opsional, untuk keamanan)
CREATE USER 'sipesda_user'@'localhost' IDENTIFIED BY 'sipesda_password123';
GRANT ALL PRIVILEGES ON sipesda_sekolah.* TO 'sipesda_user'@'localhost';
FLUSH PRIVILEGES;

-- Gunakan database
USE sipesda_sekolah;
```

#### Buat Tabel Students:
```sql
CREATE TABLE students (
  id BIGINT PRIMARY KEY,
  nisn VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(100) NOT NULL,
  kelas VARCHAR(10) NOT NULL,
  alamat TEXT,
  no_hp VARCHAR(20),
  nama_wali VARCHAR(100) NOT NULL,
  jenis_kelamin ENUM('L', 'P') NOT NULL,
  angkatan VARCHAR(4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Buat Tabel Payment Types:
```sql
CREATE TABLE payment_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  nominal DECIMAL(10,2) NOT NULL,
  periode VARCHAR(50) NOT NULL,
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Buat Tabel Payments:
```sql
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_nisn VARCHAR(20) NOT NULL,
  jenis_pembayaran VARCHAR(100) NOT NULL,
  nominal DECIMAL(10,2) NOT NULL,
  tanggal_pembayaran DATE NOT NULL,
  status ENUM('lunas', 'belum_lunas') DEFAULT 'lunas',
  keterangan TEXT,
  catatan TEXT,
  petugas VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_nisn) REFERENCES students(nisn) ON UPDATE CASCADE
);
```

#### Insert Data Default Payment Types:
```sql
INSERT INTO payment_types (nama, nominal, periode, aktif) VALUES
('SPP Bulanan', 150000, 'Bulanan', TRUE),
('Uang Gedung', 500000, 'Tahunan', TRUE),
('Uang Seragam', 300000, 'Tahunan', TRUE),
('Uang Buku', 200000, 'Tahunan', TRUE),
('Uang Kegiatan', 100000, 'Semester', TRUE);
```

### 4. Konfigurasi Backend

#### Buat file `.env` di folder `backend/`:
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=admin123
DB_NAME=sipesda_sekolah
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration (untuk akses lokal)
CORS_ORIGIN=http://localhost:3000
```

#### Install Dependencies Backend:
```bash
cd backend
npm install
```

#### Test Backend:
```bash
npm start
```
Server akan berjalan di: `http://localhost:5000`

### 5. Konfigurasi Frontend

#### Update file `frontend/src/utils/database.ts`:
```typescript
// Ganti URL API untuk lokal
const API_BASE_URL = 'http://localhost:5000/api';
```

#### Install Dependencies Frontend:
```bash
cd ../frontend
npm install
```

#### Test Frontend:
```bash
npm run dev
```
Frontend akan berjalan di: `http://localhost:3000`

### 6. Setup untuk Akses Multi-Komputer (LAN)

#### Untuk akses dari komputer lain di jaringan sekolah:

1. **Cari IP Address komputer server:**
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```

2. **Update konfigurasi frontend** di file `frontend/src/utils/database.ts`:
```typescript
// Ganti dengan IP Address komputer server
const API_BASE_URL = 'http://192.168.1.100:5000/api';
```

3. **Update CORS di backend** file `backend/.env`:
```env
CORS_ORIGIN=*
```

4. **Jalankan frontend dengan host binding:**
```bash
npm run dev -- --host 0.0.0.0
```

## 📁 Struktur File Akhir

```
SIPESDA-DEPLOY/
├── backend/
│   ├── .env              # Konfigurasi database lokal
│   ├── package.json
│   └── routes/
├── frontend/
│   ├── src/utils/database.ts  # URL API lokal
│   └── package.json
├── start-backend.bat     # Script Windows
├── start-frontend.bat    # Script Windows
└── SETUP_LOKAL_SEKOLAH.md
```

## 🚀 Script Otomatis untuk Windows

### File `start-backend.bat`:
```batch
@echo off
echo Starting SIPESDA Backend...
cd backend
npm start
pause
```

### File `start-frontend.bat`:
```batch
@echo off
echo Starting SIPESDA Frontend...
cd frontend
npm run dev
pause
```

## 🔧 Tips Konfigurasi Sekolah

### 1. **Backup Database Reguler:**
```bash
# Backup daily
mysqldump -u root -p sipesda_sekolah > backup_sipesda_$(date +%Y%m%d).sql
```

### 2. **Setup User Admin Default:**
- Username: `admin`
- Password: `admin123` (ganti setelah login pertama)

### 3. **Konfigurasi Firewall Windows:**
```
1. Buka Windows Defender Firewall
2. Advanced Settings
3. Inbound Rules → New Rule
4. Port → TCP → 5000 dan 3000
5. Allow the connection
```

### 4. **Setup Auto-Start (Opsional):**
Tambahkan script ke Windows Startup folder:
```
%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
```

## 🛠️ Troubleshooting

### Masalah Umum:

1. **Error "Cannot connect to MySQL":**
   - Pastikan MySQL service berjalan
   - Cek username/password di `.env`
   - Cek firewall MySQL port 3306

2. **Error "Port 5000 already in use":**
   - Ganti PORT di `.env` ke 5001, 5002, dll
   - Update URL di frontend sesuai port baru

3. **Frontend tidak bisa akses backend:**
   - Cek CORS_ORIGIN di `.env`
   - Pastikan IP address benar di `database.ts`

### Kontak Support:
- **Developer:** [Nama Developer]
- **Email:** [email@sekolah.sch.id]
- **WhatsApp:** [081234567890]

## 📊 Monitoring Performa

### Cek Resource Usage:
```bash
# Check RAM usage
tasklist /fi "imagename eq node.exe"

# Check MySQL processes
mysqladmin -u root -p processlist
```

---

**💡 Tips:** Simpan dokumen ini dan file `.env` di tempat yang aman. Lakukan backup database secara berkala untuk menghindari kehilangan data! 