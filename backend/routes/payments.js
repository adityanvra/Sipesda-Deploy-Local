const express = require('express');
const router = express.Router();
const { authenticateSession, requireAdminOrOperator } = require('../middleware/session');
const mysql = require('mysql2/promise');

// Database connection
const dbConfig = {
  host: process.env.MYSQLHOST || 'mysql.railway.internal',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'ZOXgksyyTFcwFYmXlJvcwTLpQtgNIBPn',
  database: process.env.MYSQLDATABASE || 'railway',
  port: process.env.MYSQLPORT || 3306
};

// GET - Read all payments (admin and operator can view)
router.get('/', authenticateSession, requireAdminOrOperator, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT p.*, s.nama as nama_siswa, s.nisn, pt.nama as nama_payment_type, pt.nominal, pt.periode
      FROM payments p
      JOIN students s ON p.student_id = s.id
      JOIN payment_types pt ON p.payment_type_id = pt.id
      ORDER BY p.created_at DESC
    `);

    await connection.end();
    res.json(rows);

  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET - Read payments by month (admin and operator can view)
router.get('/by-month', authenticateSession, requireAdminOrOperator, async (req, res) => {
  try {
    const { month, year } = req.query;
    
    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year are required' });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT p.*, s.nama as nama_siswa, s.nisn, pt.nama as nama_payment_type, pt.nominal, pt.periode
      FROM payments p
      JOIN students s ON p.student_id = s.id
      JOIN payment_types pt ON p.payment_type_id = pt.id
      WHERE MONTH(p.tanggal_bayar) = ? AND YEAR(p.tanggal_bayar) = ?
      ORDER BY p.tanggal_bayar DESC
    `, [month, year]);

    await connection.end();
    res.json(rows);

  } catch (error) {
    console.error('Get payments by month error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST - Create new payment (admin and operator can create)
router.post('/', authenticateSession, requireAdminOrOperator, async (req, res) => {
  try {
    const data = req.body;
    console.log('Create payment by user:', req.user.username, 'Role:', req.user.role);
    console.log('Payment data:', data);

    // Validate required fields
    if (!data.student_id || !data.payment_type_id || !data.tanggal_bayar || !data.jumlah_bayar) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    // Check if student exists
    const [students] = await connection.execute(
      'SELECT id FROM students WHERE id = ?',
      [data.student_id]
    );

    if (students.length === 0) {
      await connection.end();
      return res.status(400).json({ error: 'Siswa tidak ditemukan' });
    }

    // Check if payment type exists
    const [paymentTypes] = await connection.execute(
      'SELECT id FROM payment_types WHERE id = ?',
      [data.payment_type_id]
    );

    if (paymentTypes.length === 0) {
      await connection.end();
      return res.status(400).json({ error: 'Jenis pembayaran tidak ditemukan' });
    }

    // Insert payment
    const [result] = await connection.execute(
      `INSERT INTO payments (student_id, payment_type_id, tanggal_bayar, jumlah_bayar, keterangan, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.student_id,
        data.payment_type_id,
        data.tanggal_bayar,
        data.jumlah_bayar,
        data.keterangan || null,
        req.user.id
      ]
    );

    await connection.end();

    console.log('Payment created successfully, ID:', result.insertId);
    res.status(201).json({ 
      message: 'Pembayaran berhasil ditambahkan',
      payment_id: result.insertId 
    });

  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT - Update payment (admin and operator can update)
router.put('/:id', authenticateSession, requireAdminOrOperator, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    console.log('Update payment by user:', req.user.username, 'Role:', req.user.role);
    console.log('Payment ID:', id, 'Data:', data);

    // Validate required fields
    if (!data.student_id || !data.payment_type_id || !data.tanggal_bayar || !data.jumlah_bayar) {
      return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    // Check if payment exists
    const [payments] = await connection.execute(
      'SELECT id FROM payments WHERE id = ?',
      [id]
    );

    if (payments.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'Pembayaran tidak ditemukan' });
    }

    // Check if student exists
    const [students] = await connection.execute(
      'SELECT id FROM students WHERE id = ?',
      [data.student_id]
    );

    if (students.length === 0) {
      await connection.end();
      return res.status(400).json({ error: 'Siswa tidak ditemukan' });
    }

    // Check if payment type exists
    const [paymentTypes] = await connection.execute(
      'SELECT id FROM payment_types WHERE id = ?',
      [data.payment_type_id]
    );

    if (paymentTypes.length === 0) {
      await connection.end();
      return res.status(400).json({ error: 'Jenis pembayaran tidak ditemukan' });
    }

    // Update payment
    const [result] = await connection.execute(
      `UPDATE payments SET 
       student_id = ?, 
       payment_type_id = ?, 
       tanggal_bayar = ?, 
       jumlah_bayar = ?, 
       keterangan = ?,
       updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        data.student_id,
        data.payment_type_id,
        data.tanggal_bayar,
        data.jumlah_bayar,
        data.keterangan || null,
        id
      ]
    );

    await connection.end();

    console.log('Payment updated successfully');
    res.json({ message: 'Pembayaran berhasil diupdate' });

  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE - Delete payment (admin and operator can delete)
router.delete('/:id', authenticateSession, requireAdminOrOperator, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Delete payment by user:', req.user.username, 'Role:', req.user.role);
    console.log('Payment ID:', id);

    const connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(
      'DELETE FROM payments WHERE id = ?',
      [id]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Pembayaran tidak ditemukan' });
    }

    console.log('Payment deleted successfully');
    res.json({ message: 'Pembayaran berhasil dihapus' });

  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
