import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';
import Cors from 'cors';

const cors = Cors({
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  try {
    await runMiddleware(req, res, authenticateToken);

    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.userId]);
      if (result.rows.length > 0) {
        res.json(result.rows[0]);
      } else {
        res.status(404).json({ error: 'Profile not found' });
      }
    } else if (req.method === 'PUT' || req.method === 'POST') {
      const { 
        learning_style, learning_disabilities, adhd, focus_issues,
        reaction_to_failure, attitude_towards_winning_losing,
        emotional_intelligence_understanding, emotional_intelligence_hours_spent,
        core_values, internal_motivators, external_motivators,
        self_soothing_methods_healthy, self_soothing_methods_unhealthy,
        stress_management_positive, stress_management_negative,
        personal_identity, role_models, admirable_qualities, hobbies,
        challenging_topics, therapy_experience, favorite_food,
        favorite_food_reason, conflict_resolution_approach, unique_challenges
      } = req.body;

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

      res.status(200).json(result.rows[0]);
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in profile handler:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}