import jwt from 'jsonwebtoken';

export function authenticateToken(req) {
  const token = req.cookies.token;

  if (!token) {
    console.log('No token found in cookies');
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully:', decoded);
    return { userId: decoded.userId };
  } catch (e) {
    console.error('Error verifying token:', e);
    return null;
  }
}