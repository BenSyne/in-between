import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import relationshipRoutes from './routes/relationshipRoutes.js';
import { authenticateToken } from './middleware/auth.js';
import http from 'http';
import { pool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

console.log('Environment variables loaded. JWT_SECRET:', process.env.JWT_SECRET);
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('DATABASE_URL:', process.env.DATABASE_URL);

const app = express();
const port = process.env.PORT || 5001;

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/profile', authenticateToken, profileRoutes);
app.use('/api/relationships', authenticateToken, relationshipRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Add this before starting the server
pool.query('SELECT current_database()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    console.error('Error details:', err.stack);
  } else {
    console.log('Successfully connected to the database:', res.rows[0].current_database);
  }
});

const server = http.createServer(app);

server.timeout = 300000; // Increase to 5 minutes (300000 ms)

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

console.log('JWT_SECRET is set:', !!process.env.JWT_SECRET);

export default app;