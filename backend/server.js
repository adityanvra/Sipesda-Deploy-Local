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
app.use(bodyParser.json());

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    message: 'Debug endpoint works! - FORCE REDEPLOY',
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
    version: '1.0.1'
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

// API routes
app.use('/api/users', users);
app.use('/api/students', students);
app.use('/api/payments', payments);
app.use('/api/payment-types', paymentTypes);

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
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server berjalan di port ${PORT}`));