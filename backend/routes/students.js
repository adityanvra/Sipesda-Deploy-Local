const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { authenticateSession, requireAdminOrOperator } = require('../middleware/session');

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'ballast.proxy.rlwy.net',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 50251,
};

router.get('/', authenticateSession, requireAdminOrOperator, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [results] = await connection.execute('SELECT * FROM students ORDER BY created_at DESC');
    await connection.end();
    res.json(results);
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.get('/:id', authenticateSession, requireAdminOrOperator, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Support pencarian by NISN (primary key) atau ID lama
    let sql, param;
    if (req.params.id.length > 10) {
      // Jika lebih dari 10 karakter, kemungkinan NISN
      sql = 'SELECT * FROM students WHERE nisn = ?';
      param = req.params.id;
    } else {
      // Jika kurang, bisa ID lama atau NISN pendek
      sql = 'SELECT * FROM students WHERE nisn = ? OR id = ?';
      param = req.params.id;
    }
    
    const [results] = await connection.execute(sql, sql.includes('OR') ? [param, param] : [param]);
    await connection.end();
    res.json(results[0] || null);
  } catch (err) {
    console.error('Get student by id error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.get('/nisn/:nisn', authenticateSession, requireAdminOrOperator, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [results] = await connection.execute('SELECT * FROM students WHERE nisn = ?', [req.params.nisn]);
    await connection.end();
    res.json(results[0] || null);
  } catch (err) {
    console.error('Get student by nisn error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.post('/', authenticateSession, requireAdminOrOperator, async (req, res) => {
  try {
    const data = req.body;
    console.log('Received data:', data);
    console.log('User:', req.user.username, 'Role:', req.user.role);
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Check if NISN already exists
    const [existing] = await connection.execute('SELECT nisn FROM students WHERE nisn = ?', [data.nisn]);
    if (existing.length > 0) {
      await connection.end();
      return res.status(400).json({ error: 'NISN sudah terdaftar', details: 'Student with this NISN already exists' });
    }
    
    // Generate numeric ID from NISN (use last 9 digits to fit INT range)
    const numericId = parseInt(data.nisn.toString().slice(-9)) || Date.now();
    
    const sql = `INSERT INTO students (id, nisn, nama, kelas, alamat, no_hp, nama_wali, jenis_kelamin, angkatan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`;
    const values = [
      numericId, // Use shortened NISN as ID
      data.nisn,
      data.nama || data.nama_lengkap || data.name, 
      data.kelas, 
      data.alamat, 
      data.no_hp || data.no_telepon, 
      data.nama_wali || data.nama_orang_tua,
      data.jenis_kelamin || 'L',
      data.angkatan || new Date().getFullYear().toString()
    ];
    
    console.log('SQL:', sql);
    console.log('Values:', values);
    
    const [result] = await connection.execute(sql, values);
    await connection.end();
    console.log('Insert result:', result);
    
    res.json({ message: 'Siswa ditambahkan', nisn: data.nisn });
  } catch (err) {
    console.error('Create student error:', err);
    console.error('Error details:', err.code, err.errno, err.sqlMessage);
    res.status(500).json({ error: 'Database error', details: err.message, sqlError: err.sqlMessage });
  }
});

router.put('/:id', authenticateSession, requireAdminOrOperator, async (req, res) => {
  try {
    const data = req.body;
    console.log('Update by user:', req.user.username, 'Role:', req.user.role);
    
    const connection = await mysql.createConnection(dbConfig);
    
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
      await connection.end();
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    // Update by NISN (primary key) if possible, otherwise by ID
    let whereClause = 'nisn = ?';
    let whereValue = req.params.id;
    
    // Jika ID tidak terlihat seperti NISN, coba cari by ID dulu untuk mendapatkan NISN
    if (req.params.id.length <= 10) {
      try {
        const [existing] = await connection.execute('SELECT nisn FROM students WHERE id = ?', [req.params.id]);
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
    await connection.execute(sql, [...values, whereValue]);
    await connection.end();
    res.json({ message: 'Siswa diperbarui' });
  } catch (err) {
    console.error('Update student error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.delete('/:id', authenticateSession, requireAdminOrOperator, async (req, res) => {
  try {
    console.log('Delete by user:', req.user.username, 'Role:', req.user.role);
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Delete by NISN (primary key) if possible, otherwise by ID
    let whereClause = 'nisn = ?';
    let whereValue = req.params.id;
    
    if (req.params.id.length <= 10) {
      try {
        const [existing] = await connection.execute('SELECT nisn FROM students WHERE id = ?', [req.params.id]);
        if (existing.length > 0) {
          whereValue = existing[0].nisn;
        }
      } catch (err) {
        whereClause = 'id = ?';
        whereValue = req.params.id;
      }
    }
    
    await connection.execute(`DELETE FROM students WHERE ${whereClause}`, [whereValue]);
    await connection.end();
    res.json({ message: 'Siswa dihapus' });
  } catch (err) {
    console.error('Delete student error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
