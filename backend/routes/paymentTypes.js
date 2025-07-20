const express = require('express');
const router = express.Router();
const db = require('../db');

// Import permission middleware
const usersRouter = require('./users');
const requireAuth = usersRouter.requireAuth;
const requirePermission = usersRouter.requirePermission;

// GET - Read payment types (admin and operator can view)
router.get('/', requireAuth, requirePermission('payment_types', 'read'), async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM payment_types WHERE aktif = 1');
    res.json(results);
  } catch (err) {
    console.error('Get payment types error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// GET - Read payment type by ID (admin and operator can view)
router.get('/:id', requireAuth, requirePermission('payment_types', 'read'), async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db.execute('SELECT * FROM payment_types WHERE id = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Jenis pembayaran tidak ditemukan' });
    }
    
    res.json(results[0]);
  } catch (err) {
    console.error('Get payment type error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// POST - Create payment type (admin only)
router.post('/', requireAuth, requirePermission('payment_types', 'create'), async (req, res) => {
  try {
    const { nama, nominal, periode } = req.body;
    
    // Check if payment type already exists
    const [existing] = await db.execute('SELECT id FROM payment_types WHERE nama = ?', [nama]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Jenis pembayaran sudah ada' });
    }
    
    const sql = 'INSERT INTO payment_types (nama, nominal, periode, aktif) VALUES (?, ?, ?, 1)';
    const [result] = await db.execute(sql, [nama, nominal, periode]);
    
    res.json({ message: 'Jenis pembayaran berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error('Create payment type error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// PUT - Update payment type (admin only)
router.put('/:id', requireAuth, requirePermission('payment_types', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, nominal, periode, aktif } = req.body;
    
    // Check if payment type exists
    const [existing] = await db.execute('SELECT id FROM payment_types WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Jenis pembayaran tidak ditemukan' });
    }
    
    // Check if name already exists (if changing name)
    if (nama) {
      const [nameExists] = await db.execute('SELECT id FROM payment_types WHERE nama = ? AND id != ?', [nama, id]);
      if (nameExists.length > 0) {
        return res.status(400).json({ error: 'Nama jenis pembayaran sudah digunakan' });
      }
    }
    
    // Build update query
    const updates = [];
    const values = [];
    
    if (nama) {
      updates.push('nama = ?');
      values.push(nama);
    }
    
    if (nominal !== undefined) {
      updates.push('nominal = ?');
      values.push(nominal);
    }
    
    if (periode) {
      updates.push('periode = ?');
      values.push(periode);
    }
    
    if (aktif !== undefined) {
      updates.push('aktif = ?');
      values.push(aktif ? 1 : 0);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data yang diupdate' });
    }
    
    values.push(id);
    const sql = `UPDATE payment_types SET ${updates.join(', ')} WHERE id = ?`;
    await db.execute(sql, values);
    
    res.json({ message: 'Jenis pembayaran berhasil diupdate' });
  } catch (err) {
    console.error('Update payment type error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// DELETE - Delete payment type (admin only)
router.delete('/:id', requireAuth, requirePermission('payment_types', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if payment type exists
    const [existing] = await db.execute('SELECT id FROM payment_types WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Jenis pembayaran tidak ditemukan' });
    }
    
    // Check if payment type is used in payments
    const [payments] = await db.execute('SELECT id FROM payments WHERE jenis_pembayaran = (SELECT nama FROM payment_types WHERE id = ?)', [id]);
    if (payments.length > 0) {
      return res.status(400).json({ error: 'Tidak dapat menghapus jenis pembayaran yang sedang digunakan' });
    }
    
    await db.execute('DELETE FROM payment_types WHERE id = ?', [id]);
    res.json({ message: 'Jenis pembayaran berhasil dihapus' });
  } catch (err) {
    console.error('Delete payment type error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;