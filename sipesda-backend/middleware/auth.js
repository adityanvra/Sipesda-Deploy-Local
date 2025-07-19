const jwt = require('jsonwebtoken');

// JWT Secret - menggunakan environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'sipesda_secret_key_2024_production';

// Log JWT secret status for debugging
console.log('Auth middleware loaded - JWT_SECRET:', JWT_SECRET ? 'SET' : 'NOT_SET');
console.log('Environment NODE_ENV:', process.env.NODE_ENV);

// Middleware untuk authentication
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        message: 'Token autentikasi diperlukan'
      });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT verification failed:', err.message);
        console.error('JWT Secret used:', JWT_SECRET ? 'SET' : 'NOT_SET');
        return res.status(403).json({ 
          error: 'Invalid or expired token',
          message: 'Token tidak valid atau sudah kadaluarsa'
        });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication error',
      message: 'Terjadi kesalahan pada autentikasi'
    });
  }
};

// Middleware untuk authorization (admin only)
const requireAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Autentikasi diperlukan'
      });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Admin access required',
        message: 'Akses admin diperlukan'
      });
    }
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({ 
      error: 'Authorization error',
      message: 'Terjadi kesalahan pada otorisasi'
    });
  }
};

// Middleware untuk authorization (admin atau operator)
const requireAdminOrOperator = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Autentikasi diperlukan'
      });
    }
    
    if (!['admin', 'operator'].includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Admin atau operator access required',
        message: 'Akses admin atau operator diperlukan'
      });
    }
    next();
  } catch (error) {
    console.error('AdminOrOperator middleware error:', error);
    return res.status(500).json({ 
      error: 'Authorization error',
      message: 'Terjadi kesalahan pada otorisasi'
    });
  }
};

// Optional authentication - jika ada token, verify, jika tidak ada skip
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Optional auth JWT error:', err.message);
        req.user = null;
      } else {
        req.user = user;
      }
      next();
    });
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    req.user = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireAdminOrOperator,
  optionalAuth,
  JWT_SECRET
}; 