const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { authenticateToken, requireAdminOrOperator } = require('../middleware/auth');

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'mysql.railway.internal',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'railway',
  port: process.env.DB_PORT || 3306,
};

router.get('/', authenticateToken, requireAdminOrOperator, async (req, res) => {
  try {
    const studentId = req.query.student_id;
    const studentNisn = req.query.student_nisn;
    
    const connection = await mysql.createConnection(dbConfig);
    
    let sql = 'SELECT * FROM payments';
    let params = [];
    
    if (studentNisn) {
      // Use NISN if provided
      sql += ' WHERE student_nisn = ?';
      params.push(studentNisn);
    } else if (studentId) {
      const [studentResult] = await connection.execute('SELECT nisn FROM students WHERE id = ?', [studentId]);
      if (studentResult.length > 0) {
        sql += ' WHERE student_nisn = ?';
        params.push(studentResult[0].nisn);
      } else {
        await connection.end();
        return res.json([]); // No student found
      }
    }
    
    sql += ' ORDER BY tanggal_pembayaran DESC, created_at DESC';
    
    const [results] = await connection.execute(sql, params);
    await connection.end();
    res.json(results);
  } catch (err) {
    console.error('Get payments error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.get('/by-month', authenticateToken, requireAdminOrOperator, async (req, res) => {
  try {
    const { studentId, studentNisn, month, year } = req.query;
    let nisn = studentNisn;

    const connection = await mysql.createConnection(dbConfig);

    // If studentId is provided instead of NISN, convert it
    if (!nisn && studentId) {
      const [studentResult] = await connection.execute('SELECT nisn FROM students WHERE id = ?', [studentId]);
      if (studentResult.length > 0) {
        nisn = studentResult[0].nisn;
      } else {
        await connection.end();
        return res.json([]); // No student found
      }
    }

    const query = `
      SELECT * FROM payments 
      WHERE student_nisn = ? 
        AND MONTH(tanggal_pembayaran) = ? 
        AND YEAR(tanggal_pembayaran) = ?
        AND jenis_pembayaran LIKE '%SPP%'
      ORDER BY tanggal_pembayaran DESC
    `;

    const [results] = await connection.execute(query, [nisn, month, year]);
    await connection.end();
    res.json(results);
  } catch (err) {
    console.error('Get payments by month error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.post('/', authenticateToken, requireAdminOrOperator, async (req, res) => {
  try {
    const data = req.body;
    let studentNisn = data.student_nisn;
    let studentId = data.student_id;

    const connection = await mysql.createConnection(dbConfig);

    // Support legacy student_id by converting to NISN
    if (!studentNisn && studentId) {
      const [studentResult] = await connection.execute('SELECT nisn FROM students WHERE id = ?', [studentId]);
      if (studentResult.length > 0) {
        studentNisn = studentResult[0].nisn;
      } else {
        await connection.end();
        return res.status(400).json({ error: 'Student not found' });
      }
    }

    // If we have NISN but no student_id, get student_id from NISN
    if (studentNisn && !studentId) {
      const [studentResult] = await connection.execute('SELECT id FROM students WHERE nisn = ?', [studentNisn]);
      if (studentResult.length > 0) {
        studentId = studentResult[0].id;
      } else {
        await connection.end();
        return res.status(400).json({ error: 'Student not found' });
      }
    }

    if (!studentNisn) {
      await connection.end();
      return res.status(400).json({ error: 'student_nisn is required' });
    }

    // Use the logged in user as petugas if not provided
    const petugas = data.petugas || req.user.nama_lengkap || req.user.username;

    const sql = `INSERT INTO payments (student_nisn, jenis_pembayaran, nominal, tanggal_pembayaran, status, keterangan, catatan, petugas, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    const values = [
      studentNisn,
      data.jenis_pembayaran, 
      data.nominal, 
      data.tanggal_pembayaran, 
      data.status || 'lunas', 
      data.keterangan || '', 
      data.catatan || '', 
      petugas
    ];
    const [result] = await connection.execute(sql, values);
    await connection.end();
    
    console.log('Payment added by:', req.user.username, 'Role:', req.user.role);
    res.json({ message: 'Pembayaran ditambahkan', id: result.insertId });
  } catch (err) {
    console.error('Create payment error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.put('/:id', authenticateToken, requireAdminOrOperator, async (req, res) => {
  try {
    const data = req.body;
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Build update fields dynamically
    const validFields = [];
    const values = [];
    
    // Handle student_nisn conversion if student_id is provided
    if (data.student_id && !data.student_nisn) {
      const [studentResult] = await connection.execute('SELECT nisn FROM students WHERE id = ?', [data.student_id]);
      if (studentResult.length > 0) {
        data.student_nisn = studentResult[0].nisn;
      }
    }
    
    const allowedFields = ['student_nisn', 'jenis_pembayaran', 'nominal', 'tanggal_pembayaran', 'status', 'keterangan', 'catatan', 'petugas'];
    
    allowedFields.forEach(field => {
      if (data.hasOwnProperty(field) && data[field] !== undefined) {
        validFields.push(`${field} = ?`);
        values.push(data[field]);
      }
    });
    
    if (validFields.length === 0) {
      await connection.end();
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    const sql = `UPDATE payments SET ${validFields.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await connection.execute(sql, [...values, req.params.id]);
    await connection.end();
    
    console.log('Payment updated by:', req.user.username, 'Role:', req.user.role);
    res.json({ message: 'Pembayaran diperbarui' });
  } catch (err) {
    console.error('Update payment error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

router.delete('/:id', authenticateToken, requireAdminOrOperator, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    await connection.execute('DELETE FROM payments WHERE id = ?', [req.params.id]);
    await connection.end();
    
    console.log('Payment deleted by:', req.user.username, 'Role:', req.user.role);
    res.json({ message: 'Pembayaran dihapus' });
  } catch (err) {
    console.error('Delete payment error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;
