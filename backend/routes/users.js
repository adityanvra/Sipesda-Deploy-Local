const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// Generate session token
function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Check if session is valid
async function validateSession(sessionToken) {
  try {
    const [sessions] = await db.execute(
      'SELECT * FROM user_sessions WHERE session_token = ? AND expires_at > NOW()',
      [sessionToken]
    );
    
    if (sessions.length === 0) return null;
    
    // Update last activity
    await db.execute(
      'UPDATE user_sessions SET last_activity = NOW() WHERE session_token = ?',
      [sessionToken]
    );
    
    return sessions[0];
  } catch (err) {
    console.error('Session validation error:', err);
    return null;
  }
}

// Middleware to check session
async function requireAuth(req, res, next) {
  const sessionToken = req.headers['x-session-token'] || req.cookies?.sessionToken;
  
  if (!sessionToken) {
    return res.status(401).json({ error: 'Session token required' });
  }
  
  const session = await validateSession(sessionToken);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  
  // Get user data
  const [users] = await db.execute('SELECT * FROM users WHERE id = ?', [session.user_id]);
  if (users.length === 0) {
    return res.status(401).json({ error: 'User not found' });
  }
  
  req.user = users[0];
  req.session = session;
  next();
}

// Middleware to check permissions
function requirePermission(permission, action) {
  return async (req, res, next) => {
    try {
      const [permissions] = await db.execute(
        'SELECT * FROM user_permissions WHERE user_id = ? AND permission = ?',
        [req.user.id, permission]
      );
      
      if (permissions.length === 0) {
        return res.status(403).json({ error: 'Permission denied' });
      }
      
      const userPermission = permissions[0];
      if (!userPermission[`can_${action}`]) {
        return res.status(403).json({ error: `Cannot ${action} ${permission}` });
      }
      
      next();
    } catch (err) {
      console.error('Permission check error:', err);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
}

// Login user with session
router.post('/login', async (req, res) => {
  try {
    const { username, password, rememberMe } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ? AND is_active = 1';
    const [results] = await db.execute(sql, [username, password]);
    
    if (results.length === 0) {
      return res.status(401).json({ message: 'User tidak ditemukan atau tidak aktif' });
    }
    
    const user = results[0];
    
    // Generate session token
    const sessionToken = generateSessionToken();
    const expiresAt = rememberMe 
      ? new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
      : new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    // Create session
    await db.execute(
      'INSERT INTO user_sessions (user_id, session_token, remember_me, expires_at) VALUES (?, ?, ?, ?)',
      [user.id, sessionToken, rememberMe ? 1 : 0, expiresAt]
    );
    
    // Set session cookie
    res.cookie('sessionToken', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: rememberMe ? 24 * 60 * 60 * 1000 : 10 * 60 * 1000
    });
    
    res.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        is_active: user.is_active
      },
      session_token: sessionToken,
      expires_at: expiresAt
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Logout user
router.post('/logout', requireAuth, async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM user_sessions WHERE session_token = ?',
      [req.session.session_token]
    );
    
    res.clearCookie('sessionToken');
    res.json({ message: 'Logout berhasil' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Check session validity
router.get('/session', requireAuth, async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      username: req.user.username,
      role: req.user.role,
      is_active: req.user.is_active
    },
    session: {
      expires_at: req.session.expires_at,
      last_activity: req.session.last_activity
    }
  });
});

// Create new user (registration)
router.post('/', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    // Check if username already exists
    const [existing] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }
    
    const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
    const [result] = await db.execute(sql, [username, password, role || 'operator']);
    
    // Set default permissions based on role
    const defaultPermissions = role === 'admin' 
      ? [
          { permission: 'users', can_read: 1, can_create: 1, can_update: 1, can_delete: 1 },
          { permission: 'students', can_read: 1, can_create: 1, can_update: 1, can_delete: 1 },
          { permission: 'payments', can_read: 1, can_create: 1, can_update: 1, can_delete: 1 },
          { permission: 'payment_types', can_read: 1, can_create: 1, can_update: 1, can_delete: 1 }
        ]
      : [
          { permission: 'students', can_read: 1, can_create: 0, can_update: 0, can_delete: 0 },
          { permission: 'payments', can_read: 1, can_create: 1, can_update: 1, can_delete: 0 },
          { permission: 'payment_types', can_read: 1, can_create: 0, can_update: 0, can_delete: 0 }
        ];
    
    for (const perm of defaultPermissions) {
      await db.execute(
        'INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete) VALUES (?, ?, ?, ?, ?, ?)',
        [result.insertId, perm.permission, perm.can_read, perm.can_create, perm.can_update, perm.can_delete]
      );
    }
    
    res.json({ message: 'User berhasil ditambahkan', id: result.insertId });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get all users (admin only)
router.get('/', requireAuth, requirePermission('users', 'read'), async (req, res) => {
  try {
    const [results] = await db.execute('SELECT id, username, role, is_active, created_at, updated_at FROM users ORDER BY created_at DESC');
    res.json(results);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get user by ID
router.get('/:id', requireAuth, requirePermission('users', 'read'), async (req, res) => {
  try {
    const { id } = req.params;
    const [results] = await db.execute('SELECT id, username, role, is_active, created_at, updated_at FROM users WHERE id = ?', [id]);
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    
    res.json(results[0]);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Get user permissions
router.get('/:id/permissions', requireAuth, requirePermission('users', 'read'), async (req, res) => {
  try {
    const { id } = req.params;
    const [permissions] = await db.execute('SELECT * FROM user_permissions WHERE user_id = ?', [id]);
    res.json(permissions);
  } catch (err) {
    console.error('Get user permissions error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update user permissions
router.put('/:id/permissions', requireAuth, requirePermission('users', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    
    // Check if user exists
    const [existing] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    
    // Delete existing permissions
    await db.execute('DELETE FROM user_permissions WHERE user_id = ?', [id]);
    
    // Insert new permissions
    for (const perm of permissions) {
      await db.execute(
        'INSERT INTO user_permissions (user_id, permission, can_read, can_create, can_update, can_delete) VALUES (?, ?, ?, ?, ?, ?)',
        [id, perm.permission, perm.can_read ? 1 : 0, perm.can_create ? 1 : 0, perm.can_update ? 1 : 0, perm.can_delete ? 1 : 0]
      );
    }
    
    res.json({ message: 'Permissions berhasil diupdate' });
  } catch (err) {
    console.error('Update user permissions error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update user (admin only)
router.put('/:id', requireAuth, requirePermission('users', 'update'), async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role, is_active } = req.body;
    
    // Check if user exists
    const [existing] = await db.execute('SELECT id FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    
    // Check if username already exists (if changing username)
    if (username) {
      const [usernameExists] = await db.execute('SELECT id FROM users WHERE username = ? AND id != ?', [username, id]);
      if (usernameExists.length > 0) {
        return res.status(400).json({ error: 'Username sudah digunakan' });
      }
    }
    
    // Build update query
    const updates = [];
    const values = [];
    
    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    
    if (password) {
      updates.push('password = ?');
      values.push(password);
    }
    
    if (role) {
      updates.push('role = ?');
      values.push(role);
    }
    
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(is_active ? 1 : 0);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data yang diupdate' });
    }
    
    values.push(id);
    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await db.execute(sql, values);
    
    res.json({ message: 'User berhasil diupdate' });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Update own profile (no special permissions required)
router.put('/profile/update', requireAuth, async (req, res) => {
  try {
    const { username, password } = req.body;
    const userId = req.user.id;
    
    // Check if username already exists (if changing username)
    if (username) {
      const [usernameExists] = await db.execute('SELECT id FROM users WHERE username = ? AND id != ?', [username, userId]);
      if (usernameExists.length > 0) {
        return res.status(400).json({ error: 'Username sudah digunakan' });
      }
    }
    
    // Build update query
    const updates = [];
    const values = [];
    
    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    
    if (password) {
      updates.push('password = ?');
      values.push(password);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Tidak ada data yang diupdate' });
    }
    
    values.push(userId);
    const sql = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`;
    await db.execute(sql, values);
    
    res.json({ message: 'Profil berhasil diupdate' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', requireAuth, requirePermission('users', 'delete'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const [existing] = await db.execute('SELECT id, role FROM users WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }
    
    // Prevent deleting the last admin
    const [adminCount] = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = "admin" AND is_active = 1');
    if (adminCount[0].count <= 1 && existing[0].role === 'admin') {
      return res.status(400).json({ error: 'Tidak dapat menghapus admin terakhir' });
    }
    
    // Soft delete by setting is_active = 0
    await db.execute('UPDATE users SET is_active = 0 WHERE id = ?', [id]);
    
    res.json({ message: 'User berhasil dinonaktifkan' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Keep session alive
router.post('/keep-alive', requireAuth, async (req, res) => {
  try {
    // Update last activity and extend session if needed
    const newExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // Extend by 1 hour
    
    await db.execute(
      'UPDATE user_sessions SET last_activity = NOW(), expires_at = ? WHERE session_token = ?',
      [newExpiresAt, req.session.session_token]
    );
    
    res.json({ 
      message: 'Session kept alive',
      expires_at: newExpiresAt
    });
  } catch (err) {
    console.error('Keep alive error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

// Clean up expired sessions (cron job)
router.post('/cleanup-sessions', async (req, res) => {
  try {
    await db.execute('DELETE FROM user_sessions WHERE expires_at < NOW()');
    res.json({ message: 'Expired sessions cleaned up' });
  } catch (err) {
    console.error('Cleanup sessions error:', err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});

module.exports = router;

// Export middleware functions for use in other routes
module.exports.requireAuth = requireAuth;
module.exports.requirePermission = requirePermission;