require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Modular Routes and Error Handlers
const apiRoutes = require('./src/routes');
const { notFound, errorHandler } = require('./src/middlewares/error.middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Global Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Documentation / Health Redirection
app.get('/', (req, res) => {
  res.redirect('/api');
});

// Mount All API Routes
app.use('/api', apiRoutes);

// 404 Catch-All Middleware
app.use(notFound);

// Global Error Handler Middleware
app.use(errorHandler);

// Start Server if executed directly (e.g. node app.js / nodemon app.js)
if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` College Portal Backend running on port: ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` URL: http://localhost:${PORT}`);
    console.log(`===============================================`);
  });

  // Handle Unhandled Rejections and Uncaught Exceptions
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection]: ${err.message}`);
    server.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    console.error(`[Uncaught Exception]: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

module.exports = app;
