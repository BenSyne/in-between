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
const port = process.env.PORT || 5001;

const corsOptions = {
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/profile', authenticateToken, profileRoutes);
app.use('/api/relationships', authenticateToken, relationshipRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;