import jwt from 'jsonwebtoken';
import { pool } from '../db';

export const authenticateToken = (req) => {
  return new Promise((resolve) => {
    const token = req.cookies.token;

    if (!token) {
      return resolve(null);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Error verifying token:', err);
        return resolve(null);
      }
      resolve(user);
    });
  });
};