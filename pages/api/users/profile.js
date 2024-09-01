import { authenticateToken } from '../../../src/middleware/auth';
import { pool } from '../../../src/db';

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
    const user = await authenticateToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userProfile = result.rows[0];
    delete userProfile.password; // Remove sensitive information

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}