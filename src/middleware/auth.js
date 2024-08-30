const jwt = require('jsonwebtoken');

function authenticateToken(req, res) {
  return new Promise((resolve, reject) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
      res.status(401).json({ error: 'No token provided' });
      reject('No token provided');
      return;
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        res.status(403).json({ error: 'Invalid token' });
        reject('Invalid token');
        return;
      }

      req.user = user;
      resolve();
    });
  });
}

module.exports = { authenticateToken };