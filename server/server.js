const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const Book = require('./models/Book');
const { seed } = require('./scripts/seedBooks');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger in dev
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'LibraChain Backend API',
    version: '1.0.0',
    network: 'Ethereum Sepolia Testnet (11155111)',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;

// Start Server and ensure database readiness
const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty
    const bookCount = await Book.countDocuments();
    if (bookCount < 10) {
      console.log('[Startup] Database contains fewer than 10 books. Running auto-seed with 106 real books...');
      await seed();
    } else {
      console.log(`[Startup] Database ready with ${bookCount} books in catalogue.`);
    }

    const server = app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`  LIBRACHAIN SERVER RUNNING`);
      console.log(`  Port: http://localhost:${PORT}`);
      console.log(`  Health: http://localhost:${PORT}/api/health`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`======================================================\n`);
    });

    return server;
  } catch (error) {
    console.error('Fatal Server Startup Error:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
