import jwt from 'jsonwebtoken';

export function authenticateToken(req) {
  return new Promise((resolve, reject) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('No token provided');
      return resolve(null);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('JWT verification error:', err);
        return resolve(null);
      }
      console.log('Token verified, user:', user);
      resolve(user);
    });
  });
}