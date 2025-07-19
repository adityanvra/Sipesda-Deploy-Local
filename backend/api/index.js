const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const users = require('../routes/users');
const students = require('../routes/students');
const payments = require('../routes/payments');
const paymentTypes = require('../routes/paymentTypes');

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

// Health check
app.get('/api', (req, res) => {
  res.json({ 
    message: '🚀 Sipesda Backend API berjalan di Vercel!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Environment debug
app.get('/api/debug', (req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    hasDbHost: !!process.env.DB_HOST,
    hasDbUser: !!process.env.DB_USER,
    hasDbPassword: !!process.env.DB_PASSWORD,
    hasDbName: !!process.env.DB_NAME,
    hasDbPort: !!process.env.DB_PORT,
    hasJwtSecret: !!process.env.JWT_SECRET,
    dbHost: process.env.DB_HOST || 'not set',
    dbPort: process.env.DB_PORT || 'not set'
  });
});

// Simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Test login endpoint
app.post('/api/test-login', (req, res) => {
  res.json({
    message: 'Test login endpoint reached',
    body: req.body,
    env: process.env.NODE_ENV,
    hasDbHost: !!process.env.DB_HOST,
    hasDbPassword: !!process.env.DB_PASSWORD
  });
});

// Simple login endpoint for testing
app.post('/api/simple-login', (req, res) => {
  const { username, password } = req.body;
  
  if (username === 'admin' && password === 'admin123') {
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'sipesda_secret_key_2024_production';
    
    const token = jwt.sign(
      { 
        id: 1, 
        username: 'admin', 
        role: 'admin',
        nama_lengkap: 'Administrator'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login berhasil (simple mode)',
      token,
      user: {
        id: 1,
        username: 'admin',
        nama_lengkap: 'Administrator',
        role: 'admin',
        email: 'admin@sipesda.com',
        no_hp: '08123456789',
        aktif: true
      }
    });
  } else {
    res.status(401).json({ error: 'Username atau password salah' });
  }
});



// Routes
app.use('/api/users', users);
app.use('/api/students', students);
app.use('/api/payments', payments);
app.use('/api/payment-types', paymentTypes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Sipesda Backend API berjalan di Vercel!',
    docs: '/api',
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

module.exports = app; 