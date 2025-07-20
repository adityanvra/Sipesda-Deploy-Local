const express = require('express');
const router = express.Router();
const db = require('../db');

// Import permission middleware
const usersRouter = require('./users');
const requireAuth = usersRouter.requireAuth;
const requirePermission = usersRouter.requirePermission;

// GET - Read payments (admin and operator can view)
router.get('/', requireAuth, requirePermission('payments', 'read'), async (req, res) => {
  try {
    const studentId = req.query.student_id;
    const studentNisn = req.query.student_nisn;
    let sql = 'SELECT * FROM payments';
    let params = [];
    
    if (studentNisn) {
      // Use NISN if provided
      sql += ' WHERE student_nisn = ?';
      params.push(studentNisn);
    } else if (studentId) {
      const [studentResult] = await db.execute('SELECT nisn FROM students WHERE id = ?', [studentId]);
      if (studentResult.length > 0) {
        sql += ' WHERE student_nisn = ?';
        params.push(studentResult[0].nisn);
      } else {
        return res.json([]); // No student found
      }
    }
    
    const [results] = await db.execute(sql, params);
    res.json(results);
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// GET - Read payment by ID (admin and operator can view)
router.get('/:id', requireAuth, requirePermission('payments', 'read'), async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db.execute('SELECT * FROM payments WHERE id = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Pembayaran tidak ditemukan' });
    }
    
    res.json(results[0]);
  } catch (err) {
    console.error('Get payment error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// POST - Create payment (admin and operator can create)
router.post('/', requireAuth, requirePermission('payments', 'create'), async (req, res) => {
  try {
    const data = req.body;
    let studentNisn = data.student_nisn;
    let studentId = data.student_id;

    // Support legacy student_id by converting to NISN
    if (!studentNisn && studentId) {
      const [studentResult] = await db.execute('SELECT nisn FROM students WHERE id = ?', [studentId]);
      if (studentResult.length > 0) {
        studentNisn = studentResult[0].nisn;
      } else {
        return res.status(400).json({ error: 'Student not found' });
      }
    }

    // If we have NISN but no student_id, get student_id from NISN
    if (studentNisn && !studentId) {
      const [studentResult] = await db.execute('SELECT id FROM students WHERE nisn = ?', [studentNisn]);
      if (studentResult.length > 0) {
        studentId = studentResult[0].id;
      } else {
        return res.status(400).json({ error: 'Student not found' });
      }
    }

    if (!studentNisn || !studentId) {
      return res.status(400).json({ error: 'student_nisn or student_id is required' });
    }

    const sql = `INSERT INTO payments (student_id, student_nisn, jenis_pembayaran, nominal, tanggal_pembayaran, status, keterangan, catatan, petugas, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    const values = [
      studentId, // Now properly populated
      studentNisn,
      data.jenis_pembayaran, 
      data.nominal, 
      data.tanggal_pembayaran, 
      data.status, 
      data.keterangan, 
      data.catatan, 
      data.petugas
    ];
    const [result] = await db.execute(sql, values);
    res.json({ message: 'Pembayaran ditambahkan', id: result.insertId });
  } catch (err) {
    console.error('Create payment error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// PUT - Update payment (admin and operator can update)
router.put('/:id', requireAuth, requirePermission('payments', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    // Check if payment exists
    const [existing] = await db.execute('SELECT id FROM payments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Pembayaran tidak ditemukan' });
    }
    
    // Build update query
    const updates = [];
    const values = [];
    
    const allowedFields = ['jenis_pembayaran', 'nominal', 'tanggal_pembayaran', 'status', 'keterangan', 'catatan', 'petugas'];
    
    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field) && data[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(data[field]);
      }
    });
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data yang diupdate' });
    }
    
    values.push(id);
    const sql = `UPDATE payments SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await db.execute(sql, values);
    
    res.json({ message: 'Pembayaran berhasil diupdate' });
  } catch (err) {
    console.error('Update payment error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// DELETE - Delete payment (admin only)
router.delete('/:id', requireAuth, requirePermission('payments', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if payment exists
    const [existing] = await db.execute('SELECT id FROM payments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Pembayaran tidak ditemukan' });
    }
    
    await db.execute('DELETE FROM payments WHERE id = ?', [id]);
    res.json({ message: 'Pembayaran berhasil dihapus' });
  } catch (err) {
    console.error('Delete payment error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
