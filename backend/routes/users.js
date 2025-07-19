const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const mysql = require('mysql2/promise');

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sipesda_sekolah',
  port: process.env.DB_PORT || 3306,
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'sipesda_secret_key_2024';

// Middleware untuk authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware untuk authorization (admin only)
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// POST /api/users/login - User login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password harus diisi' });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE username = ? AND aktif = TRUE',
      [username]
    );

    await connection.end();

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    // Update last login
    const connectionUpdate = await mysql.createConnection(dbConfig);
    await connectionUpdate.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );
    await connectionUpdate.end();

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        nama_lengkap: user.nama_lengkap 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Don't send password in response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login berhasil',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users/register - User registration (admin only atau initial setup)
router.post('/register', async (req, res) => {
  try {
    const { username, password, nama_lengkap, role, email, no_hp } = req.body;

    if (!username || !password || !nama_lengkap) {
      return res.status(400).json({ error: 'Username, password, dan nama lengkap harus diisi' });
    }

    // Validate role
    if (role && !['admin', 'operator'].includes(role)) {
      return res.status(400).json({ error: 'Role harus admin atau operator' });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    // Check if username already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      await connection.end();
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const [result] = await connection.execute(
      `INSERT INTO users (username, password, nama_lengkap, role, email, no_hp, aktif) 
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [username, hashedPassword, nama_lengkap, role || 'operator', email || null, no_hp || null]
    );

    await connection.end();

    res.status(201).json({ 
      message: 'User berhasil didaftarkan',
      user_id: result.insertId 
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users - Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      `SELECT id, username, nama_lengkap, role, email, no_hp, aktif, last_login, created_at, updated_at 
       FROM users ORDER BY created_at DESC`
    );

    await connection.end();
    res.json(rows);

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/profile - Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(
      `SELECT id, username, nama_lengkap, role, email, no_hp, aktif, last_login, created_at 
       FROM users WHERE id = ?`,
      [req.user.id]
    );

    await connection.end();

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json(rows[0]);

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, nama_lengkap, role, email, no_hp, aktif } = req.body;

    if (!nama_lengkap) {
      return res.status(400).json({ error: 'Nama lengkap harus diisi' });
    }

    // Validate role
    if (role && !['admin', 'operator'].includes(role)) {
      return res.status(400).json({ error: 'Role harus admin atau operator' });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    // Check if username already exists (excluding current user)
    if (username) {
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, id]
      );

      if (existingUsers.length > 0) {
        await connection.end();
        return res.status(400).json({ error: 'Username sudah digunakan' });
      }
    }

    // Update user
    const updateFields = [];
    const updateValues = [];

    if (username) {
      updateFields.push('username = ?');
      updateValues.push(username);
    }
    if (nama_lengkap) {
      updateFields.push('nama_lengkap = ?');
      updateValues.push(nama_lengkap);
    }
    if (role) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (no_hp !== undefined) {
      updateFields.push('no_hp = ?');
      updateValues.push(no_hp);
    }
    if (aktif !== undefined) {
      updateFields.push('aktif = ?');
      updateValues.push(aktif);
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(id);

    const [result] = await connection.execute(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json({ message: 'User berhasil diupdate' });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/users/:id/password - Change user password (admin only atau current user)
router.put('/:id/password', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    // Check if admin or current user
    if (req.user.role !== 'admin' && req.user.id != id) {
      return res.status(403).json({ error: 'Akses ditolak' });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password baru minimal 6 karakter' });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    // Get current user data
    const [users] = await connection.execute(
      'SELECT password FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      await connection.end();
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    // For non-admin users, verify old password
    if (req.user.role !== 'admin' || oldPassword) {
      if (!oldPassword) {
        await connection.end();
        return res.status(400).json({ error: 'Password lama harus diisi' });
      }

      const validOldPassword = await bcrypt.compare(oldPassword, users[0].password);
      if (!validOldPassword) {
        await connection.end();
        return res.status(400).json({ error: 'Password lama salah' });
      }
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    const [result] = await connection.execute(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );

    await connection.end();

    res.json({ message: 'Password berhasil diubah' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user.id == id) {
      return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri' });
    }

    const connection = await mysql.createConnection(dbConfig);
    
    const [result] = await connection.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );

    await connection.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    res.json({ message: 'User berhasil dihapus' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/users/validate-token - Validate JWT token
router.post('/validate-token', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      nama_lengkap: req.user.nama_lengkap
    }
  });
});

module.exports = router;