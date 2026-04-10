require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');

// Validate Environment Variables
const requiredEnv = ['MONGO_URI', 'JWT_SECRET'];
requiredEnv.forEach(env => {
  if (!process.env[env]) {
    console.error(`❌ CRITICAL ERROR: ${env} environment variable is missing!`);
    process.exit(1);
  }
});

const app = express();

// Security & Performance Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Gzip compression
app.use(morgan('dev')); // Request logging

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Trust Proxy (Essential for Render/Vercel behind proxies)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
const allowedOrigins = [
  'http://localhost:5173', // Local Dev
  process.env.CLIENT_URL,   // Production Frontend
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded receipts
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/goals', require('./routes/goals'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/groups', require('./routes/groups'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', app: 'Budgeto API' }));

// Serve Static Files (Production)
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));

  // Robust catch-all for SPA: Use a Regular Expression to avoid string-parsing issues in Express 5
  app.get(/^(?!\/api).+/, (req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server = app.listen(PORT, () => console.log(`🚀 Budgeto API running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    if (process.env.NODE_ENV !== 'production') {
      console.log('Starting server without DB for development...');
      server = app.listen(PORT, () => console.log(`🚀 Budgeto API running on port ${PORT} (no DB)`));
    } else {
      process.exit(1);
    }
  });

// Graceful Shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      console.log('HTTP server closed');
      mongoose.connection.close(false, () => {
        console.log('MongoDB connection closed');
        process.exit(0);
      });
    });
  }
});
