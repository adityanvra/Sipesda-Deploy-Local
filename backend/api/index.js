const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const users = require('../routes/users');
const students = require('../routes/students');
const payments = require('../routes/payments');
const paymentTypes = require('../routes/paymentTypes');

const app = express();

// CORS configuration for production - Update dengan domain Vercel Anda  
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://sipesda-deploy.vercel.app', // Frontend URL yang sudah ada
        'https://sipesda-deploy-git-main.vercel.app',  // Alternative domain
        'https://sipesda-deploy-git-main-adityanvra.vercel.app' // Vercel branch URL
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
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Routes
app.use('/api/users', users);
app.use('/api/students', students);
app.use('/api/payments', payments);
app.use('/api/payment-types', paymentTypes);

// Health check
app.get('/api', (req, res) => {
  res.json({ 
    message: '🚀 Sipesda Backend API berjalan di Vercel!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    lastUpdate: '2025-07-19 - Fixed DB credentials' 
  });
});

// Simple environment debug
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
    dbPort: process.env.DB_PORT || 'not set',
    allEnvVars: {
      NODE_ENV: process.env.NODE_ENV,
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_NAME: process.env.DB_NAME,
      DB_PORT: process.env.DB_PORT,
      hasPassword: !!process.env.DB_PASSWORD,
      hasJWT: !!process.env.JWT_SECRET
    }
  });
});

// Simple test endpoint without database
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    hasEnvVars: {
      dbHost: !!process.env.DB_HOST,
      dbPassword: !!process.env.DB_PASSWORD,
      jwtSecret: !!process.env.JWT_SECRET
    }
  });
});

// Simple login test
app.post('/api/test-login', async (req, res) => {
  try {
    res.json({
      message: 'Test login endpoint reached',
      body: req.body,
      hasRequiredEnvVars: !!(process.env.DB_HOST && process.env.DB_PASSWORD)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Environment check
app.get('/api/env-check', (req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    database: {
      host: process.env.DB_HOST || 'not set',
      user: process.env.DB_USER || 'not set',
      name: process.env.DB_NAME || 'not set',
      port: process.env.DB_PORT || 'not set',
      hasPassword: !!process.env.DB_PASSWORD
    },
    auth: {
      hasJWTSecret: !!process.env.JWT_SECRET
    }
  });
});

// Database connection test
app.get('/api/db-test', async (req, res) => {
  try {
    const mysql = require('mysql2/promise');
    const dbConfig = {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
    };
    
    console.log('Testing DB connection with config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port,
      hasPassword: !!dbConfig.password
    });
    
    const connection = await mysql.createConnection(dbConfig);
    await connection.execute('SELECT 1 as test');
    await connection.end();
    
    res.json({ status: 'Database connection successful' });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message,
      code: error.code 
    });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Sipesda Backend API berjalan di Vercel!',
    docs: '/api',
    timestamp: new Date().toISOString()
  });
});

// Add error handling middleware (MUST BE LAST!)
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

module.exports = app; 