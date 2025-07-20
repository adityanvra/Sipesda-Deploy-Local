const express = require('express');
const router = express.Router();
const db = require('../db');

// Import permission middleware
const usersRouter = require('./users');
const requireAuth = usersRouter.requireAuth;
const requirePermission = usersRouter.requirePermission;

// GET - Read students (admin and operator can view)
router.get('/', requireAuth, requirePermission('students', 'read'), async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM students');
    res.json(results);
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// GET - Read student by ID/NISN (admin and operator can view)
router.get('/:id', requireAuth, requirePermission('students', 'read'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Getting student by ID/NISN:', id);
    console.log('📋 Request headers:', req.headers);
    console.log('📋 Request method:', req.method);
    console.log('📋 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      MYSQLHOST: process.env.MYSQLHOST || 'not set',
      MYSQLDATABASE: process.env.MYSQLDATABASE || 'not set',
      MYSQLPORT: process.env.MYSQLPORT || 'not set',
      MYSQLUSER: process.env.MYSQLUSER || 'not set',
      MYSQLPASSWORD: process.env.MYSQLPASSWORD ? 'set' : 'not set'
    });
    
    // Validate input
    if (!id || id.trim() === '') {
      console.log('❌ Invalid ID/NISN provided');
      return res.status(400).json({ error: 'ID/NISN tidak valid' });
    }
    
    // Support pencarian by NISN atau ID
    let sql, param;
    if (id.length > 10) {
      // Jika lebih dari 10 karakter, kemungkinan NISN
      sql = 'SELECT * FROM students WHERE nisn = ?';
      param = id;
      console.log('🔍 Searching by NISN:', id);
    } else {
      // Jika kurang, bisa ID atau NISN pendek
      sql = 'SELECT * FROM students WHERE nisn = ? OR id = ?';
      param = id;
      console.log('🔍 Searching by ID or NISN:', id);
    }
    
    console.log('📋 Executing SQL:', sql, 'with params:', [param]);
    const [results] = await db.execute(sql, sql.includes('OR') ? [param, param] : [param]);
    console.log('📋 Query results:', results.length, 'records found');
    
    if (results.length === 0) {
      console.log('❌ Student not found');
      return res.status(404).json({ error: 'Siswa tidak ditemukan', searchedId: id });
    }
    
    console.log('✅ Student found:', results[0].nama);
    res.json(results[0]);
  } catch (err) {
    console.error('Get student error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// POST - Create student (admin only)
router.post('/', requireAuth, requirePermission('students', 'create'), async (req, res) => {
  try {
    const data = req.body;
    console.log('Received data:', data);
    
    // Check if NISN already exists
    const [existing] = await db.execute('SELECT nisn FROM students WHERE nisn = ?', [data.nisn]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'NISN sudah terdaftar', details: 'Student with this NISN already exists' });
    }
    
    const sql = `INSERT INTO students (nisn, nama, kelas, alamat, no_hp, nama_wali, jenis_kelamin, angkatan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      data.nisn,
      data.nama || data.nama_lengkap || data.name, 
      data.kelas || '1A', // Default kelas
      data.alamat || '', 
      data.no_hp || data.no_telepon || '', 
      data.nama_wali || data.nama_orang_tua || '',
      data.jenis_kelamin || 'L',
      data.angkatan || new Date().getFullYear().toString()
    ];
    
    console.log('SQL:', sql);
    console.log('Values:', values);
    
    const [result] = await db.execute(sql, values);
    console.log('Insert result:', result);
    
    res.json({ message: 'Siswa ditambahkan', nisn: data.nisn });
  } catch (err) {
    console.error('Create student error:', err);
    console.error('Error details:', err.code, err.errno, err.sqlMessage);
    res.status(500).json({ error: 'Database error', details: err.message, sqlError: err.sqlMessage });
  }
});

// PUT - Update student (admin only)
router.put('/:id', requireAuth, requirePermission('students', 'update'), async (req, res) => {
  try {
    const data = req.body;
    // Updated field mapping untuk database yang sudah diubah
    const validFields = [];
    const values = [];
    
    // Direct mapping - sesuai dengan database schema
    const allowedFields = ['nisn', 'nama', 'kelas', 'alamat', 'no_hp', 'nama_wali', 'jenis_kelamin', 'angkatan'];
    
    // Handle nama field mapping untuk backward compatibility
    if (data.nama_lengkap && !data.nama) {
      data.nama = data.nama_lengkap;
    }
    
    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field) && data[field] !== undefined) {
        validFields.push(`${field} = ?`);
        values.push(data[field]);
      }
    });
    
    // Support for legacy field names
    if (data.no_telepon && !data.no_hp) {
      validFields.push('no_hp = ?');
      values.push(data.no_telepon);
    }
    if (data.nama_orang_tua && !data.nama_wali) {
      validFields.push('nama_wali = ?');
      values.push(data.nama_orang_tua);
    }
    
    if (validFields.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    // Update by NISN (primary key) if possible, otherwise by ID
    let whereClause = 'nisn = ?';
    let whereValue = req.params.id;
    
    // Jika ID tidak terlihat seperti NISN, coba cari by ID dulu untuk mendapatkan NISN
    if (req.params.id.length <= 10) {
      try {
        const [existing] = await db.execute('SELECT nisn FROM students WHERE id = ?', [req.params.id]);
        if (existing.length > 0) {
          whereValue = existing[0].nisn;
        }
      } catch (err) {
        // Fallback ke pencarian by parameter asli
        whereClause = 'id = ?';
        whereValue = req.params.id;
      }
    }
    
    const sql = `UPDATE students SET ${validFields.join(', ')}, updated_at = NOW() WHERE ${whereClause}`;
    await db.execute(sql, [...values, whereValue]);
    res.json({ message: 'Siswa diperbarui' });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// DELETE - Delete student (admin only)
router.delete('/:id', requireAuth, requirePermission('students', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if student exists
    const [existing] = await db.execute('SELECT id FROM students WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Siswa tidak ditemukan' });
    }
    
    // Check if student has payments
    const [payments] = await db.execute('SELECT id FROM payments WHERE student_id = ?', [id]);
    if (payments.length > 0) {
      return res.status(400).json({ error: 'Tidak dapat menghapus siswa yang memiliki riwayat pembayaran' });
    }
    
    await db.execute('DELETE FROM students WHERE id = ?', [id]);
    res.json({ message: 'Siswa berhasil dihapus' });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
