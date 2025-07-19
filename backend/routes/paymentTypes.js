const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { authenticateToken, requireAdminOrOperator, requireAdmin } = require('../middleware/auth');

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sipesda_sekolah',
  port: process.env.DB_PORT || 3306,
};

// GET - Read payment types (admin and operator can view)
router.get('/', authenticateToken, requireAdminOrOperator, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    const [results] = await connection.execute('SELECT * FROM payment_types WHERE aktif = 1 ORDER BY nama');
    await connection.end();
    res.json(results);
  } catch (err) {
    console.error('Get payment types error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// POST - Create new payment type (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
  const { nama, nominal, periode, aktif = true } = req.body;
    
    if (!nama || !nominal || !periode) {
      return res.status(400).json({ error: 'Nama, nominal, dan periode harus diisi' });
    }
    
    const connection = await mysql.createConnection(dbConfig);
  const sql = 'INSERT INTO payment_types (nama, nominal, periode, aktif) VALUES (?, ?, ?, ?)';
    const [result] = await connection.execute(sql, [nama, nominal, periode, aktif]);
    await connection.end();
    
    console.log('Payment type created by:', req.user.username, 'Role:', req.user.role);
    res.json({ message: 'Jenis pembayaran ditambahkan', id: result.insertId });
  } catch (err) {
    console.error('Create payment type error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// PUT - Update payment type (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { nama, nominal, periode, aktif } = req.body;
    const { id } = req.params;
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Build update fields dynamically
    const validFields = [];
    const values = [];
    
    if (nama) {
      validFields.push('nama = ?');
      values.push(nama);
    }
    if (nominal !== undefined) {
      validFields.push('nominal = ?');
      values.push(nominal);
    }
    if (periode) {
      validFields.push('periode = ?');
      values.push(periode);
    }
    if (aktif !== undefined) {
      validFields.push('aktif = ?');
      values.push(aktif);
    }
    
    if (validFields.length === 0) {
      await connection.end();
      return res.status(400).json({ error: 'No valid fields to update' });
    }
    
    validFields.push('updated_at = CURRENT_TIMESTAMP');
    const sql = `UPDATE payment_types SET ${validFields.join(', ')} WHERE id = ?`;
    values.push(id);
    
    const [result] = await connection.execute(sql, values);
    await connection.end();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment type not found' });
    }
    
    console.log('Payment type updated by:', req.user.username, 'Role:', req.user.role);
    res.json({ message: 'Jenis pembayaran diperbarui' });
  } catch (err) {
    console.error('Update payment type error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// DELETE - Delete payment type (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const connection = await mysql.createConnection(dbConfig);
    
    // Soft delete - set aktif to false
    const [result] = await connection.execute(
      'UPDATE payment_types SET aktif = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
    await connection.end();
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment type not found' });
    }
    
    console.log('Payment type deleted by:', req.user.username, 'Role:', req.user.role);
    res.json({ message: 'Jenis pembayaran dihapus' });
  } catch (err) {
    console.error('Delete payment type error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;