const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

// Load routes with error handling
let users, students, payments, paymentTypes;

try {
  users = require('./routes/users');
  console.log('✅ Users route loaded successfully');
} catch (error) {
  console.error('❌ Failed to load users route:', error);
  users = null;
}

try {
  students = require('./routes/students');
  console.log('✅ Students route loaded successfully');
} catch (error) {
  console.error('❌ Failed to load students route:', error);
  students = null;
}

try {
  payments = require('./routes/payments');
  console.log('✅ Payments route loaded successfully');
} catch (error) {
  console.error('❌ Failed to load payments route:', error);
  payments = null;
}

try {
  paymentTypes = require('./routes/paymentTypes');
  console.log('✅ PaymentTypes route loaded successfully');
} catch (error) {
  console.error('❌ Failed to load paymentTypes route:', error);
  paymentTypes = null;
}

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://sipesda-deploy.vercel.app',
        'https://sipesda-deploy-git-main.vercel.app',
        'https://sipesda-deploy-git-main-adityanvra.vercel.app'
      ]
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(bodyParser.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({ error: 'Invalid JSON' });
      throw new Error('Invalid JSON');
    }
  }
}));

// Body parser error handling
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    console.error('Body parser error:', error);
    return res.status(400).json({ 
      error: 'Invalid JSON in request body',
      message: error.message
    });
  }
  next();
});

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'Debug endpoint works! - FORCE REDEPLOY V2',
    routes: {
      users: !!users,
      students: !!students,
      payments: !!payments,
      paymentTypes: !!paymentTypes
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      hasDbHost: !!process.env.DB_HOST,
      hasDbPassword: !!process.env.DB_PASSWORD
    },
    timestamp: new Date().toISOString(),
    version: '1.0.2',
    deployment: 'FORCE REDEPLOY V2'
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: '🚀 Sipesda Backend Berjalan dengan Baik!',
    timestamp: new Date().toISOString()
  });
});

// Users health check
app.get('/api/users/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'Users route berfungsi!',
    timestamp: new Date().toISOString()
  });
});

// Fallback login endpoint for testing
app.post('/api/users/login', (req, res) => {
  try {
    console.log('Fallback login endpoint reached');
    console.log('Request body:', req.body);
    console.log('Routes status:', {
      users: !!users,
      students: !!students,
      payments: !!payments,
      paymentTypes: !!paymentTypes
    });
    
    res.json({
      message: 'Fallback login endpoint reached',
      body: req.body,
      routes: {
        users: !!users,
        students: !!students,
        payments: !!payments,
        paymentTypes: !!paymentTypes
      },
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasDbHost: !!process.env.DB_HOST,
        hasDbPassword: !!process.env.DB_PASSWORD
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Fallback login error:', error);
    res.status(500).json({
      error: 'Fallback login error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes with fallback
if (users) {
  app.use('/api/users', users);
  console.log('✅ Users route mounted');
} else {
  console.log('❌ Users route not available');
}

if (students) {
  app.use('/api/students', students);
  console.log('✅ Students route mounted');
} else {
  console.log('❌ Students route not available');
}

if (payments) {
  app.use('/api/payments', payments);
  console.log('✅ Payments route mounted');
} else {
  console.log('❌ Payments route not available');
}

if (paymentTypes) {
  app.use('/api/payment-types', paymentTypes);
  console.log('✅ PaymentTypes route mounted');
} else {
  console.log('❌ PaymentTypes route not available');
}

app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Sipesda Backend Berjalan dengan Baik!',
    docs: '/api/health',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware (MUST BE LAST!)
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  console.error('Error stack:', error.stack);
  console.error('Request path:', req.path);
  console.error('Request method:', req.method);
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
  console.log(`📅 Deployment timestamp: ${new Date().toISOString()}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});