const jwt = require('jsonwebtoken');

function authenticateToken(token) {
  if (!token) return null;

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return user;
  } catch (error) {
    return null;
  }
}

module.exports = { authenticateToken };