require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` College Portal Server running on port: ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` URL: http://localhost:${PORT}`);
      console.log(`===============================================`);
    });

    // Handle Unhandled Promise Rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[Unhandled Rejection]: ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Handle Uncaught Exceptions
    process.on('uncaughtException', (err) => {
      console.error(`[Uncaught Exception]: ${err.message}`);
      server.close(() => process.exit(1));
    });
  } catch (error) {
    console.error(`[Server Initialization Error]: ${error.message}`);
    process.exit(1);
  }
};

startServer();
wan