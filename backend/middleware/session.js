// Session middleware to replace JWT authentication
const sessions = new Map();

// Session validation function
const validateSession = (sessionId) => {
  const session = sessions.get(sessionId);
  if (!session) return null;
  
  // Check if session expired
  if (new Date() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }
  
  return session;
};

// Session authentication middleware
const authenticateSession = (req, res, next) => {
  const sessionId = req.headers['x-session-id'];
  
  if (!sessionId) {
    return res.status(401).json({ error: 'Session ID required' });
  }

  const session = validateSession(sessionId);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  // Add session data to request
  req.session = session;
  req.user = {
    id: session.userId,
    username: session.username,
    role: session.role,
    nama_lengkap: session.nama_lengkap
  };

  next();
};

// Admin authorization middleware
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

// Admin or Operator authorization middleware
const requireAdminOrOperator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'operator') {
    return res.status(403).json({ error: 'Admin or operator access required' });
  }

  next();
};

// Export sessions map for use in other files
const getSessions = () => sessions;

module.exports = {
  authenticateSession,
  requireAdmin,
  requireAdminOrOperator,
  validateSession,
  getSessions
}; 