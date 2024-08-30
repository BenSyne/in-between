require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const profileRoutes = require('./routes/profileRoutes');
const relationshipRoutes = require('./routes/relationshipRoutes');
const { authenticateToken } = require('./middleware/auth');
const http = require('http');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5001;

// Logging middleware (move this before route definitions)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // or whatever port your Next.js app is running on
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/relationships', authenticateToken, relationshipRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the AI-Enhanced Chat Application API' });
});

// Error handling middleware (place this after all route definitions)
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message, stack: err.stack });
});

server.on('error', (error) => {
  console.error('Server error:', error);
});

// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;