import express from 'express';
import { pool } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  console.log('GET /api/profile route hit');
  console.log('User:', req.user);
  
  try {
    const result = await pool.query(
      'SELECT * FROM user_profiles WHERE user_id = $1',
      [req.user.userId]
    );
    console.log('Query result:', result.rows);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      console.log('Profile not found for user:', req.user.userId);
      res.status(404).json({ error: 'Profile not found' });
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Error fetching user profile', details: error.message });
  }
});

// Update user profile
router.put('/', authenticateToken, async (req, res) => {
  console.log('PUT /api/profile route hit');
  console.log('User:', req.user);
  console.log('Request body:', req.body);
  const {
    learning_style,
    learning_disabilities,
    adhd,
    focus_issues,
    reaction_to_failure,
    attitude_towards_winning_losing,
    emotional_intelligence_understanding,
    emotional_intelligence_hours_spent,
    core_values,
    internal_motivators,
    external_motivators,
    self_soothing_methods_healthy,
    self_soothing_methods_unhealthy,
    stress_management_positive,
    stress_management_negative,
    personal_identity,
    role_models,
    admirable_qualities,
    hobbies,
    challenging_topics,
    therapy_experience,
    favorite_food,
    favorite_food_reason,
    conflict_resolution_approach,
    unique_challenges
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO user_profiles (
        user_id, learning_style, learning_disabilities, adhd, focus_issues,
        reaction_to_failure, attitude_towards_winning_losing,
        emotional_intelligence_understanding, emotional_intelligence_hours_spent,
        core_values, internal_motivators, external_motivators,
        self_soothing_methods_healthy, self_soothing_methods_unhealthy,
        stress_management_positive, stress_management_negative,
        personal_identity, role_models, admirable_qualities, hobbies,
        challenging_topics, therapy_experience, favorite_food,
        favorite_food_reason, conflict_resolution_approach, unique_challenges
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
      ON CONFLICT (user_id) DO UPDATE SET
        learning_style = EXCLUDED.learning_style,
        learning_disabilities = EXCLUDED.learning_disabilities,
        adhd = EXCLUDED.adhd,
        focus_issues = EXCLUDED.focus_issues,
        reaction_to_failure = EXCLUDED.reaction_to_failure,
        attitude_towards_winning_losing = EXCLUDED.attitude_towards_winning_losing,
        emotional_intelligence_understanding = EXCLUDED.emotional_intelligence_understanding,
        emotional_intelligence_hours_spent = EXCLUDED.emotional_intelligence_hours_spent,
        core_values = EXCLUDED.core_values,
        internal_motivators = EXCLUDED.internal_motivators,
        external_motivators = EXCLUDED.external_motivators,
        self_soothing_methods_healthy = EXCLUDED.self_soothing_methods_healthy,
        self_soothing_methods_unhealthy = EXCLUDED.self_soothing_methods_unhealthy,
        stress_management_positive = EXCLUDED.stress_management_positive,
        stress_management_negative = EXCLUDED.stress_management_negative,
        personal_identity = EXCLUDED.personal_identity,
        role_models = EXCLUDED.role_models,
        admirable_qualities = EXCLUDED.admirable_qualities,
        hobbies = EXCLUDED.hobbies,
        challenging_topics = EXCLUDED.challenging_topics,
        therapy_experience = EXCLUDED.therapy_experience,
        favorite_food = EXCLUDED.favorite_food,
        favorite_food_reason = EXCLUDED.favorite_food_reason,
        conflict_resolution_approach = EXCLUDED.conflict_resolution_approach,
        unique_challenges = EXCLUDED.unique_challenges,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [
        req.user.userId, learning_style, learning_disabilities, adhd, focus_issues,
        reaction_to_failure, attitude_towards_winning_losing,
        emotional_intelligence_understanding, emotional_intelligence_hours_spent,
        core_values, internal_motivators, external_motivators,
        self_soothing_methods_healthy, self_soothing_methods_unhealthy,
        stress_management_positive, stress_management_negative,
        personal_identity, role_models, admirable_qualities, hobbies,
        challenging_topics, therapy_experience, favorite_food,
        favorite_food_reason, conflict_resolution_approach, unique_challenges
      ]
    );
    console.log('Query result:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Error updating user profile', details: error.message });
  }
});

export default router;