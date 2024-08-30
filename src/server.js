require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
console.log('Environment variables loaded. JWT_SECRET:', process.env.JWT_SECRET);
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('DATABASE_URL:', process.env.DATABASE_URL);
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const profileRoutes = require('./routes/profileRoutes');
const relationshipRoutes = require('./routes/relationshipRoutes');
const { authenticateToken } = require('./middleware/auth');
const http = require('http');
const { pool } = require('./db');

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
  console.log('Headers:', req.headers);
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
  } else {
    console.log('Successfully connected to the database:', res.rows[0].current_database);
  }
});

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

console.log('JWT_SECRET is set:', !!process.env.JWT_SECRET);

module.exports = app;