import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export const authenticateToken = (req) => {
  return new Promise((resolve, reject) => {
    const cookies = parse(req.headers.cookie || '');
    const token = cookies.token;
    
    if (!token) {
      console.log('No token found in cookies');
      return resolve(null);
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not set');
      return resolve(null);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Token verification failed:', err);
        return resolve(null);
      }
      console.log('Token verified successfully');
      resolve(user);
    });
  });
};