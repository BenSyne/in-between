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
import { Server } from 'socket.io';
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
  origin: ['http://localhost:3000', 'http://localhost:5001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/api/users', userRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);
app.use('/api/profile', authenticateToken, profileRoutes);
app.use('/api/relationships', authenticateToken, relationshipRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working' });
});

pool.query('SELECT current_database()', (err, res) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    console.error('Error details:', err.stack);
  } else {
    console.log('Successfully connected to the database:', res.rows[0].current_database);
  }
});

// Make sure this route is defined before other routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:5001'],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

io.on('connection', (socket) => {
  console.log('New socket connection established');

  socket.on('joinUser', (userId) => {
    console.log(`User ${userId} joining room`);
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('createChat', async (data) => {
    try {
      const { userId, friendId, isAIChat } = data;
      const chatResult = await pool.query(
        'INSERT INTO chats (is_ai_chat) VALUES ($1) RETURNING *',
        [isAIChat]
      );
      const newChat = chatResult.rows[0];
      await pool.query(
        'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2)',
        [newChat.id, userId]
      );
      if (!isAIChat && friendId) {
        await pool.query(
          'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2)',
          [newChat.id, friendId]
        );
      }
      io.emit('newChat', newChat);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  });

  socket.on('sendMessage', async (data) => {
    try {
      const { chatId, content, senderId } = data;
      const messageResult = await pool.query(
        'INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
        [chatId, senderId, content]
      );
      const newMessage = messageResult.rows[0];
      const participantsResult = await pool.query(
        'SELECT user_id FROM chat_participants WHERE chat_id = $1',
        [chatId]
      );
      const participants = participantsResult.rows.map(row => row.user_id);
      participants.forEach(participantId => {
        io.to(`user_${participantId}`).emit('newMessage', newMessage);
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Health check endpoint available at http://localhost:${port}/health`);
});

console.log('JWT_SECRET is set:', !!process.env.JWT_SECRET);

export { io, server, app };