export default function handler(req, res) {
  if (req.method === 'POST') {
    // Clear the authentication cookies
    res.setHeader('Set-Cookie', [
      'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax',
      'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
    ]);
    res.status(200).json({ message: 'Logged out successfully' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}