const jwt = require('jsonwebtoken');

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
      console.error('JWT verification failed:', err.message);
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

// Middleware untuk authorization (admin atau operator)
const requireAdminOrOperator = (req, res, next) => {
  if (!['admin', 'operator'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Admin atau operator access required' });
  }
  next();
};

// Optional authentication - jika ada token, verify, jika tidak ada skip
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAdminOrOperator,
  optionalAuth,
  JWT_SECRET
}; 