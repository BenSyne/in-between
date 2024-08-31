import { pool } from '../../../src/db';
import { authenticateToken } from '../../../src/middleware/auth';

// Helper function to validate and truncate string values
function sanitizeProfileData(obj) {
  const fieldLengths = {
    learning_style: 20,
    learning_disabilities: 20,
    adhd: 20,
    focus_issues: 20,
    reaction_to_failure: 30,
    attitude_towards_winning_losing: 30,
    emotional_intelligence_understanding: 255,
    emotional_intelligence_hours_spent: null,
    core_values: null,
    internal_motivators: null,
    external_motivators: null,
    self_soothing_methods_healthy: null,
    self_soothing_methods_unhealthy: null,
    stress_management_positive: null,
    stress_management_negative: null,
    personal_identity: 255,
    role_models: null,
    admirable_qualities: null,
    hobbies: null,
    challenging_topics: null,
    therapy_experience: 20,
    favorite_food: 255,
    favorite_food_reason: 255,
    conflict_resolution_approach: 255,
    unique_challenges: 255
  };

  const allowedValues = {
    learning_style: ['visual', 'auditory', 'kinesthetic', 'combination'],
    learning_disabilities: ['none', 'yes', 'prefer_not_to_say', 'possibly'],
    adhd: ['not_tested', 'tested_positive', 'tested_negative', 'suspect_positive'],
    focus_issues: ['no', 'yes', 'sometimes', 'topic_dependent'],
    reaction_to_failure: ['learn_from_experience', 'analyze_and_improve', 'upset', 'see_as_challenge'],
    attitude_towards_winning_losing: ['winning_important', 'focus_on_learning', 'enjoy_competition', 'avoid_losing'],
    therapy_experience: ['none', 'curious', 'positive', 'negative']
  };
  
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => {
      if (allowedValues[key]) {
        const lowerValue = typeof value === 'string' ? value.toLowerCase() : value;
        return [key, allowedValues[key].includes(lowerValue) ? lowerValue : allowedValues[key][0]];
      }
      if (typeof value === 'string' && fieldLengths[key]) {
        return [key, value.substring(0, fieldLengths[key])];
      }
      if (Array.isArray(value) && fieldLengths[key] === null) {
        return [key, value.map(item => typeof item === 'string' ? item.substring(0, 255) : item)];
      }
      return [key, value];
    })
  );
}

export default async function handler(req, res) {
  try {
    await authenticateToken(req, res);

    if (req.method === 'GET') {
      const client = await pool.connect();
      try {
        const result = await client.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.userId]);
        if (result.rows.length > 0) {
          res.json(result.rows[0]);
        } else {
          res.status(404).json({ error: 'Profile not found' });
        }
      } finally {
        client.release();
      }
    } else if (req.method === 'PUT') {
      const client = await pool.connect();
      try {
        const sanitizedData = sanitizeProfileData(req.body);
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
        } = sanitizedData;

        const result = await client.query(
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

        res.json(result.rows[0]);
      } finally {
        client.release();
      }
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Error in profile handler:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}