const jwt = require('jsonwebtoken');

// JWT Secret - Disabled for testing
const JWT_SECRET = process.env.JWT_SECRET || 'demo_secret_key_2024';

// Middleware untuk authentication - Disabled for testing
const authenticateToken = (req, res, next) => {
  // Skip authentication for testing
  console.log('Authentication skipped for testing');
  req.user = { id: 1, username: 'demo', role: 'admin' };
  next();
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

// Optional authentication - Disabled for testing
const optionalAuth = (req, res, next) => {
  // Skip authentication for testing
  console.log('Optional auth skipped for testing');
  req.user = { id: 1, username: 'demo', role: 'admin' };
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAdminOrOperator,
  optionalAuth,
  JWT_SECRET
}; 