import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import errorHandler from './middlewares/errorHandler.js';
import { port } from './config/config.js';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Start server asynchronously
const startServer = async () => {
  // Connect to the database
  await connectDB();

  // Set up routes and error handler
  app.use('/api/auth', authRoutes);
  app.use(errorHandler);

  // Start the server
  app.listen(port, () => console.log(`Server ${port}-portda ishga tushdi`));
};

startServer();