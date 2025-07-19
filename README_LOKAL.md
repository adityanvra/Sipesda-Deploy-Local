# 🏫 SIPESDA - Deployment Lokal Sekolah

## 🚀 Quick Start

### 1. **Setup Otomatis (Recommended)**
```bash
# Jalankan script setup otomatis
quick-setup-lokal.bat
```

### 2. **Setup Manual**
```bash
# 1. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Setup database
mysql -u root -p < database-setup-lokal.sql

# 3. Konfigurasi backend
# Edit file backend/.env dengan password MySQL

# 4. Start aplikasi
start-app-lokal.bat
```

## 📋 Persyaratan

- **Node.js** v16+
- **MySQL** v8.0+
- **Git** (untuk clone repository)

## 🔧 Konfigurasi

### Backend (.env)
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=sipesda_sekolah
DB_PORT=3306
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

### Frontend (database.ts)
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```

## 🌐 Akses Aplikasi

- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:5000
- **Login Default:** admin / admin123

## 📁 File Penting

- `SETUP_LOKAL_SEKOLAH.md` - Panduan lengkap
- `database-setup-lokal.sql` - Script database
- `start-app-lokal.bat` - Start aplikasi
- `TROUBLESHOOTING_VITE.md` - Solusi error

## 🔄 Multi-Computer Access

Untuk akses dari komputer lain di jaringan sekolah:

1. **Cari IP Address server:**
```bash
ipconfig
```

2. **Update konfigurasi:**
- Frontend: `API_BASE_URL = 'http://192.168.1.100:5000/api'`
- Backend: `CORS_ORIGIN=*`

3. **Jalankan dengan host binding:**
```bash
npm run dev -- --host 0.0.0.0
```

## 🛠️ Troubleshooting

### Error Umum:
1. **Port sudah digunakan** → Ganti port di `vite.config.ts`
2. **Cannot connect to backend** → Pastikan backend berjalan
3. **Database error** → Cek konfigurasi `.env`

### Reset Konfigurasi:
```bash
# Hapus cache
rm -rf node_modules/.vite
npm install
npm run dev -- --force
```

## 📞 Support

- **Developer:** [Nama Developer]
- **Email:** [email@sekolah.sch.id]
- **WhatsApp:** [081234567890]

---

**💡 Tips:** Selalu backup database secara berkala untuk menghindari kehilangan data! 