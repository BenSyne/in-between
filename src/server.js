require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const profileRoutes = require('./routes/profileRoutes');
const relationshipRoutes = require('./routes/relationshipRoutes');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 5001; // Change this line to use a different port

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/profile', authenticateToken, profileRoutes);
app.use('/api/relationships', authenticateToken, relationshipRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the AI-Enhanced Chat Application API' });
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;