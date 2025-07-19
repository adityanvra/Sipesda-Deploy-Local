const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const users = require('./routes/users');
const students = require('./routes/students');
const payments = require('./routes/payments');
const paymentTypes = require('./routes/paymentTypes');

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
    message: 'Debug endpoint works!',
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