# Vercel Setup Guide untuk SIPESDA

## Environment Variables yang Diperlukan

Untuk mengatasi error 400 pada endpoint `/api/students`, pastikan environment variables berikut diatur di Vercel:

### 1. Buka Vercel Dashboard
1. Login ke [vercel.com](https://vercel.com)
2. Pilih project `sipesda-deploy-backend`
3. Klik tab **Settings**
4. Klik **Environment Variables**

### 2. Tambahkan Environment Variables

Tambahkan variabel berikut satu per satu:

| Variable Name | Value |
|---------------|-------|
| `MYSQL_DATABASE` | `railway` |
| `MYSQL_PUBLIC_URL` | `mysql://root:ZOXgksyyTFcwFYmXlJvcwTLpQtgNIBPn@ballast.proxy.rlwy.net:50251/railway` |
| `MYSQL_ROOT_PASSWORD` | `ZOXgksyyTFcwFYmXlJvcwTLpQtgNIBPn` |
| `MYSQL_URL` | `mysql://root:ZOXgksyyTFcwFYmXlJvcwTLpQtgNIBPn@mysql.railway.internal:3306/railway` |
| `MYSQLDATABASE` | `railway` |
| `MYSQLHOST` | `ballast.proxy.rlwy.net` |
| `MYSQLPASSWORD` | `ZOXgksyyTFcwFYmXlJvcwTLpQtgNIBPn` |
| `MYSQLPORT` | `50251` |
| `MYSQLUSER` | `root` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://sipesda-deploy-frontend.vercel.app` |

### 3. Environment Settings
- **Environment**: Pilih **Production** untuk semua variabel
- **Preview**: Pilih **Production** untuk semua variabel

### 4. Redeploy
Setelah menambahkan semua environment variables:
1. Klik **Save**
2. Klik **Redeploy** di tab **Deployments**
3. Tunggu deployment selesai

## Verifikasi Setup

Setelah redeploy, test endpoint berikut:
```
https://sipesda-deploy-backend.vercel.app/api/students/2024001002
```

Seharusnya mengembalikan data siswa, bukan error 400.

## Troubleshooting

### Jika masih error 400:
1. Periksa Vercel logs di tab **Functions**
2. Pastikan semua environment variables sudah benar
3. Pastikan database Railway berjalan dengan baik
4. Cek koneksi database di logs

### Logs yang diharapkan:
```
🔍 Getting student by ID/NISN: 2024001002
📋 Environment check: {
  NODE_ENV: 'production',
  MYSQLHOST: 'ballast.proxy.rlwy.net',
  MYSQLDATABASE: 'railway',
  MYSQLPORT: '50251',
  MYSQLUSER: 'root',
  MYSQLPASSWORD: 'set'
}
🔍 Searching by ID or NISN: 2024001002
📋 Executing SQL: SELECT * FROM students WHERE nisn = ? OR id = ? with params: [ '2024001002' ]
📋 Query results: 1 records found
✅ Student found: Siti Nurhaliza
```

## Database Connection Test

Untuk memastikan koneksi database berfungsi, jalankan:
```bash
node verify_railway_connection.js
```

Script ini akan menguji koneksi ke Railway database dan memverifikasi bahwa siswa dengan NISN `2024001002` ada di database. 