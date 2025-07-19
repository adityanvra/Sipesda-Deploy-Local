# 🔧 Troubleshooting Vite Configuration - SIPESDA

## 🚨 Error Umum dan Solusi

### 1. **Error: Port 5173 sudah digunakan**
```
Error: listen EADDRINUSE: address already in use :::5173
```

**Solusi:**
- Vite sudah dikonfigurasi untuk menggunakan port 3000
- Jika masih error, cek apakah ada aplikasi lain yang menggunakan port 3000
- Ganti port di `vite.config.ts`:
```typescript
server: {
  port: 3001, // atau port lain yang tersedia
}
```

### 2. **Error: Cannot connect to backend**
```
Error: connect ECONNREFUSED 127.0.0.1:5000
```

**Solusi:**
- Pastikan backend berjalan di port 5000
- Cek file `backend/.env` sudah benar
- Jalankan backend terlebih dahulu: `cd backend && npm start`

### 3. **Error: Module not found**
```
Error: Cannot resolve module 'axios' or 'react'
```

**Solusi:**
- Install dependencies: `npm install`
- Hapus `node_modules` dan `package-lock.json`, lalu `npm install` lagi
- Cek versi Node.js (minimal v16)

### 4. **Error: TypeScript compilation**
```
Error: Type 'X' is not assignable to type 'Y'
```

**Solusi:**
- Cek file `tsconfig.json` sudah benar
- Restart development server: `npm run dev`
- Clear cache: `npm run dev -- --force`

## ⚙️ Konfigurasi Vite untuk Deployment Lokal

### File `vite.config.ts` yang Benar:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 3000,
    host: true, // Allow external access
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['axios']
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const extType = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    }
  },
  define: {
    'process.env': {}
  },
  base: '/'
});
```

### File `package.json` Scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "dev:local": "vite --port 3000 --host"
  }
}
```

## 🔄 Langkah-langkah Reset Konfigurasi

### 1. **Reset Vite Configuration:**
```bash
# Hapus cache Vite
rm -rf node_modules/.vite

# Hapus dependencies
rm -rf node_modules package-lock.json

# Install ulang
npm install

# Jalankan dengan force
npm run dev -- --force
```

### 2. **Reset TypeScript Configuration:**
```bash
# Hapus cache TypeScript
rm -rf node_modules/.cache

# Restart development server
npm run dev
```

### 3. **Reset Environment Variables:**
```bash
# Buat file .env.local di frontend
echo "VITE_API_BASE_URL=http://localhost:5000/api" > frontend/.env.local
```

## 🌐 Konfigurasi untuk Multi-Computer Access

### Untuk akses dari komputer lain di jaringan sekolah:

1. **Update `vite.config.ts`:**
```typescript
server: {
  port: 3000,
  host: '0.0.0.0', // Allow all network interfaces
  proxy: {
    '/api': {
      target: 'http://192.168.1.100:5000', // IP komputer server
      changeOrigin: true,
      secure: false,
    }
  }
}
```

2. **Update `database.ts`:**
```typescript
const API_BASE_URL = 'http://192.168.1.100:5000/api';
```

3. **Update `backend/.env`:**
```env
CORS_ORIGIN=*
```

## 📋 Checklist Troubleshooting

### Sebelum Menjalankan Aplikasi:
- [ ] Node.js versi 16+ terinstall
- [ ] MySQL berjalan di port 3306
- [ ] Database `sipesda_sekolah` sudah dibuat
- [ ] File `backend/.env` sudah dikonfigurasi
- [ ] Dependencies sudah diinstall (`npm install`)

### Saat Menjalankan:
- [ ] Backend berjalan di port 5000
- [ ] Frontend berjalan di port 3000
- [ ] Tidak ada error di console browser
- [ ] API calls berhasil (cek Network tab)

### Jika Masih Error:
- [ ] Restart development server
- [ ] Clear browser cache
- [ ] Cek firewall settings
- [ ] Cek antivirus blocking connections

## 🆘 Kontak Support

Jika masih mengalami masalah:

1. **Cek log error di:**
   - Browser Console (F12)
   - Terminal/Command Prompt
   - Network tab di browser

2. **Informasi yang diperlukan:**
   - Versi Node.js: `node --version`
   - Versi npm: `npm --version`
   - OS: Windows/Mac/Linux
   - Error message lengkap

3. **File yang perlu dicek:**
   - `vite.config.ts`
   - `package.json`
   - `tsconfig.json`
   - `backend/.env`

---

**💡 Tips:** Selalu jalankan backend terlebih dahulu sebelum frontend untuk menghindari connection errors! 