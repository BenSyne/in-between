import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get relationships
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM relationships WHERE user_id_1 = $1 OR user_id_2 = $1',
      [req.user.userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching relationships:', error);
    res.status(500).json({ error: 'Error fetching relationships' });
  }
});

// Create relationship
router.post('/', authenticateToken, async (req, res) => {
  const { otherUserId, relationshipType } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO relationships (user_id_1, user_id_2, relationship_type) VALUES ($1, $2, $3) RETURNING *',
      [req.user.userId, otherUserId, relationshipType]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating relationship:', error);
    res.status(500).json({ error: 'Error creating relationship' });
  }
});

export default router;