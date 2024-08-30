const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../validators/userValidators');
const logger = require('../utils/logger');

// User registration
router.post('/register', validateRegistration, async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
      [username, email, hashedPassword]
    );
    const token = jwt.sign({ userId: result.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    logger.info(`User registered: ${email}`);
    res.status(201).json({ token });
  } catch (error) {
    logger.error(`Error registering user: ${error.message}`);
    res.status(500).json({ error: 'Error registering user' });
  }
});

// User login
router.post('/login', validateLogin, async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (isValidPassword) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
        logger.info(`User logged in: ${email}`);
        res.json({ token });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    logger.error(`Error logging in: ${error.message}`);
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // First, get basic user data
    const basicUserResult = await pool.query(
      'SELECT id, username, email, created_at, COALESCE(last_login, created_at) as last_login FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (basicUserResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const basicUserData = basicUserResult.rows[0];

    // Then, get user profile data
    const profileResult = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [req.user.userId]
    );

    const profileData = profileResult.rows[0] || {};

    // Combine basic user data and profile data
    const combinedData = { ...basicUserData, ...profileData };

    res.json(combinedData);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Error fetching user profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  const profileData = req.body;
  try {
    const columns = Object.keys(profileData);
    const values = Object.values(profileData);
    const setClause = columns.map((col, index) => `${col} = $${index + 2}`).join(', ');
    const query = `
      INSERT INTO user_profiles (user_id, ${columns.join(', ')})
      VALUES ($1, ${columns.map((_, index) => `$${index + 2}`).join(', ')})
      ON CONFLICT (user_id) DO UPDATE SET ${setClause}
      RETURNING *
    `;
    const result = await pool.query(query, [req.user.userId, ...values]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Error updating user profile' });
  }
});

module.exports = router;