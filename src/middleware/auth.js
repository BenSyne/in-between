import jwt from 'jsonwebtoken';

export async function authenticateToken(req) {
  const token = req.cookies.token;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { userId: decoded.userId };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}