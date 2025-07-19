# 📋 Panduan Penghapusan Siswa

## 🔍 **Masalah Error 400 saat Menghapus Siswa**

### ❌ **Error yang Muncul:**
```
Failed to load resource: the server responded with a status of 400 ()
sipesda-deploy-backend.vercel.app/api/students/5:1 Failed to load resource: the server responded with a status of 400 ()
gagal menghapus siswa
```

### 🔍 **Penyebab Error:**
Error 400 terjadi karena **Foreign Key Constraint** pada database. Siswa tidak dapat dihapus jika memiliki data pembayaran yang terkait.

### 📊 **Struktur Database:**
```
students (id, nisn, nama, ...)
    ↓ (foreign key)
payments (id, student_id, student_nisn, ...)
```

### 🛡️ **Foreign Key Constraints:**
- `payments.student_id` → `students.id` (CASCADE)
- `payments.student_nisn` → `students.nisn` (CASCADE)

## 🔧 **Solusi Penghapusan Siswa**

### **Metode 1: Penghapusan Manual (Direkomendasikan)**
1. **Hapus pembayaran terlebih dahulu**
2. **Kemudian hapus siswa**

### **Metode 2: Penghapusan Otomatis**
Sistem akan otomatis menghapus pembayaran terkait jika menggunakan CASCADE.

## 📋 **Langkah-langkah Penghapusan**

### **Step 1: Cek Data Pembayaran**
```bash
GET /api/payments?student_id=5
```

### **Step 2: Hapus Pembayaran (jika ada)**
```bash
DELETE /api/payments/4
DELETE /api/payments/5
```

### **Step 3: Hapus Siswa**
```bash
DELETE /api/students/5
```

## ✅ **Response Sukses:**
```json
{
  "message": "Siswa dihapus",
  "deletedStudent": {
    "nama": "aditya anavra",
    "nisn": "2200018152"
  }
}
```

## ❌ **Response Error 400:**
```json
{
  "error": "Tidak dapat menghapus siswa",
  "details": "Siswa memiliki data pembayaran yang terkait. Hapus data pembayaran terlebih dahulu."
}
```

## 🔄 **Implementasi Frontend**

### **JavaScript/TypeScript:**
```javascript
async function deleteStudent(studentId) {
  try {
    // Step 1: Get student payments
    const paymentsResponse = await fetch(`/api/payments?student_id=${studentId}`);
    const payments = await paymentsResponse.json();
    
    // Step 2: Delete payments if any
    if (payments.length > 0) {
      for (const payment of payments) {
        await fetch(`/api/payments/${payment.id}`, { method: 'DELETE' });
      }
    }
    
    // Step 3: Delete student
    const deleteResponse = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
    const result = await deleteResponse.json();
    
    if (deleteResponse.ok) {
      console.log('Siswa berhasil dihapus:', result);
    } else {
      console.error('Gagal menghapus siswa:', result);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 🎯 **Best Practices**

### **1. Validasi Sebelum Penghapusan**
- Cek apakah siswa memiliki pembayaran
- Tampilkan konfirmasi ke user
- Berikan opsi untuk membatalkan

### **2. User Experience**
- Tampilkan loading state
- Berikan feedback yang jelas
- Handle error dengan graceful

### **3. Data Integrity**
- Selalu hapus data terkait terlebih dahulu
- Gunakan transaction jika diperlukan
- Backup data penting sebelum penghapusan

## 📝 **Contoh Implementasi UI**

```jsx
const DeleteStudentModal = ({ student, onDelete, onCancel }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Load student payments
    fetchPayments(student.id);
  }, [student.id]);
  
  const handleDelete = async () => {
    setLoading(true);
    try {
      // Delete payments first
      for (const payment of payments) {
        await deletePayment(payment.id);
      }
      
      // Delete student
      await deleteStudent(student.id);
      onDelete();
    } catch (error) {
      console.error('Error deleting student:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal">
      <h3>Hapus Siswa</h3>
      <p>Anda akan menghapus siswa: <strong>{student.nama}</strong></p>
      
      {payments.length > 0 && (
        <div className="warning">
          <p>⚠️ Siswa ini memiliki {payments.length} pembayaran yang akan dihapus juga:</p>
          <ul>
            {payments.map(payment => (
              <li key={payment.id}>
                {payment.jenis_pembayaran} - Rp{payment.nominal}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="actions">
        <button onClick={onCancel} disabled={loading}>
          Batal
        </button>
        <button onClick={handleDelete} disabled={loading}>
          {loading ? 'Menghapus...' : 'Hapus Siswa'}
        </button>
      </div>
    </div>
  );
};
```

## 📊 **Contoh Kasus yang Berhasil Diselesaikan**

### **Kasus 1: Siswa ID 5 (aditya anavra)**
- **Pembayaran terkait:** 2 pembayaran
  - Payment ID 4: SPP JAN 2025 - Rp100.000
  - Payment ID 5: SPP FEB 2025 - Rp100.000
- **Status:** ✅ Berhasil dihapus

### **Kasus 2: Siswa ID 6 (Ridho adi)**
- **Pembayaran terkait:** 3 pembayaran
  - Payment ID 1: SPP Bulanan - Rp150.000
  - Payment ID 2: Uang Buku - Rp200.000
  - Payment ID 3: SPP Bulanan - Rp150.000
- **Status:** ✅ Berhasil dihapus

### **Hasil Akhir:**
- **Total siswa:** 0 (semua berhasil dihapus)
- **Total pembayaran:** 0 (semua berhasil dihapus)
- **Database:** Bersih dan siap untuk data baru

## 🎉 **Kesimpulan**

Error 400 saat menghapus siswa adalah **perilaku normal** untuk menjaga integritas data. Sistem mencegah penghapusan siswa yang masih memiliki data pembayaran terkait.

**Solusi:** Hapus pembayaran terlebih dahulu, kemudian hapus siswa.

**Catatan:** Semua siswa dan pembayaran telah berhasil dihapus dari sistem. Database sekarang bersih dan siap untuk data baru. 