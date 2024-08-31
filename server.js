const http = require('http');
const app = require('./app'); // Your Express app

const server = http.createServer(app);

server.maxConnections = 1000; // Adjust this value as needed
server.timeout = 300000; // Increase to 5 minutes (300000 ms)

server.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

// Handle connection errors
server.on('connection', (socket) => {
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});