const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const apiRoutes = require('./routes/api');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { closeDriver } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for local React frontend development
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API router
app.use('/api', apiRoutes);

// Root route redirect/health hint
app.get('/', (req, res) => {
  res.json({
    name: 'SkillGraph API',
    status: 'running',
    health: '/api/health',
    documentation: '/api/people'
  });
});

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

// Graceful server shutdown
let server;
if (require.main === module) {
  server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 SkillGraph Express API Server running on port ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });

  const handleShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}. Shutting down gracefully...`);
    if (server) {
      server.close(async () => {
        console.log('  └─ HTTP server closed.');
        await closeDriver();
        console.log('  └─ CognoDB driver connection pool closed.');
        process.exit(0);
      });
    } else {
      await closeDriver();
      process.exit(0);
    }
  };

  process.on('SIGINT', () => handleShutdown('SIGINT'));
  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
}

module.exports = app;
