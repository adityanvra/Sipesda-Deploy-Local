# 🏫 SIPESDA - Sistem Pembayaran Sekolah Dasar

## 📋 Overview

SIPESDA adalah sistem manajemen pembayaran sekolah dasar yang dibangun dengan React (Frontend) dan Node.js (Backend) dengan database MySQL. Sistem ini mendukung role-based access control dengan admin dan operator.

## 🚀 Quick Start

### **Cara Paling Mudah:**
1. **Jalankan file batch:**
   ```cmd
   SIPESDA_FIXED.bat
   ```

2. **Pilih option [1] untuk start aplikasi**
3. **Buka browser:** http://localhost:3000 (atau port yang terdeteksi)

### **Login Credentials:**
- **Admin:** `admin` / `admin123`
- **Operator:** `operator` / `operator123`

## 🛠️ Manual Setup (Jika Batch File Tidak Berfungsi)

### **Prerequisites:**
- Node.js (v16+)
- Laragon (untuk MySQL)
- Git

### **Installation:**
```bash
# Clone repository
git clone <repository-url>
cd SIPESDA-deploy-Mlangi

# Install dependencies
npm install
cd backend && npm install
cd ../frontend && npm install

# Setup database
# 1. Start Laragon MySQL
# 2. Create database 'sipesda'
# 3. Import database_sipesda_simple.sql
```

### **Running the Application:**
```bash
# Start both servers
npm run dev

# Or start separately
cd backend && npm run dev
cd frontend && npm run dev
```

## 📁 File Structure

```
SIPESDA-deploy-Mlangi/
├── SIPESDA_FIXED.bat          # Application manager
├── LOCAL_DEPLOYMENT.md        # Complete deployment guide
├── PERMISSION_SYSTEM.md       # Permission system guide
├── OPERATOR_CAPABILITIES.md   # Operator capabilities
├── update_operator_permissions.sql  # SQL for permission updates
├── database_sipesda_simple.sql      # Database schema
├── backend/                   # Node.js backend
├── frontend/                  # React frontend
└── package.json              # Root package.json
```

## 🔐 Permission System

### **👑 ADMIN Role**
- ✅ Full access to all features
- ✅ User management
- ✅ Student management (CRUD)
- ✅ Payment management (CRUD)
- ✅ Payment types management (CRUD)

### **👤 OPERATOR Role**
- ✅ **Data Siswa:** Read only
- ✅ **Data Pembayaran:** Create, Read, Update (no Delete)
- ✅ **Jenis Pembayaran:** Read only
- ✅ **Edit Profile:** Own username and password

## 🎯 Features

### **Authentication & Authorization**
- Role-based access control
- Session management
- Remember me functionality
- Secure password handling

### **Student Management**
- View student data (all roles)
- Add/Edit/Delete students (admin only)
- Search and filter students

### **Payment Management**
- Record student payments
- View payment history
- Update payment data
- Payment type management

### **User Management**
- User registration and login
- Profile management
- Role assignment

## 🔧 Troubleshooting

### **Port Conflicts:**
```cmd
# Use SIPESDA_FIXED.bat option [9] to clear ports
# Or manually:
taskkill /f /im node.exe
```

### **Database Issues:**
```cmd
# Use SIPESDA_FIXED.bat option [5] for database setup
# Or manually import database_sipesda_simple.sql
```

### **Permission Issues:**
```cmd
# Use SIPESDA_FIXED.bat option [7] to update operator permissions
# Or manually run update_operator_permissions.sql
```

## 📚 Documentation

- **`LOCAL_DEPLOYMENT.md`** - Complete local deployment guide
- **`PERMISSION_SYSTEM.md`** - Detailed permission system
- **`OPERATOR_CAPABILITIES.md`** - Operator role capabilities

## 🌐 Application URLs

- **Frontend:** http://localhost:3000 (or auto-detected port)
- **Backend:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health
- **phpMyAdmin:** http://localhost/phpmyadmin

## 🔄 Development

### **Backend (Node.js/Express)**
```bash
cd backend
npm run dev
```

### **Frontend (React/TypeScript)**
```bash
cd frontend
npm run dev
```

### **Database (MySQL)**
- Use Laragon for local development
- Database name: `sipesda`
- Default credentials in `database_sipesda_simple.sql`

## 📝 License

This project is for educational purposes.

## 🤝 Support

For issues and questions:
1. Check `LOCAL_DEPLOYMENT.md` for setup instructions
2. Use `SIPESDA_FIXED.bat` for application management
3. Check `PERMISSION_SYSTEM.md` for permission issues 