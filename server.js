const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('createChat', async (data) => {
    try {
      const { userId, friendId, isAIChat } = data;

      // Create a new chat in the database
      const chatResult = await pool.query(
        'INSERT INTO chats (is_ai_chat) VALUES ($1) RETURNING *',
        [isAIChat]
      );
      const newChat = chatResult.rows[0];

      // Add the user as a participant
      await pool.query(
        'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2)',
        [newChat.id, userId]
      );

      if (!isAIChat && friendId) {
        // Add the friend as a participant
        await pool.query(
          'INSERT INTO chat_participants (chat_id, user_id) VALUES ($1, $2)',
          [newChat.id, friendId]
        );
      }

      // Emit the new chat event to the client
      io.emit('newChat', newChat);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(3000, () => {
  console.log('listening on *:3000');
});