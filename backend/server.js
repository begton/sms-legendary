const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const stockInRoutes = require('./routes/stockInRoutes');
const stockOutRoutes = require('./routes/stockOutRoutes');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'sms_secret_2026',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // set true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 8 // 8 hours
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stockin', stockInRoutes);
app.use('/api/stockout', stockOutRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'DAB Enterprise SMS API is running.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SMS Backend running on http://localhost:${PORT}`);
});
