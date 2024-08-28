-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create user_profiles table
CREATE TABLE user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    learning_style VARCHAR(20) CHECK (learning_style IN ('visual', 'auditory', 'kinesthetic', 'combination')),
    learning_disabilities VARCHAR(20) CHECK (learning_disabilities IN ('none', 'yes', 'prefer_not_to_say', 'possibly')),
    adhd VARCHAR(20) CHECK (adhd IN ('not_tested', 'tested_positive', 'tested_negative', 'suspect_positive')),
    focus_issues VARCHAR(20) CHECK (focus_issues IN ('no', 'yes', 'sometimes', 'topic_dependent')),
    reaction_to_failure VARCHAR(30) CHECK (reaction_to_failure IN ('learn_from_experience', 'analyze_and_improve', 'upset', 'see_as_challenge')),
    attitude_towards_winning_losing VARCHAR(30) CHECK (attitude_towards_winning_losing IN ('winning_important', 'focus_on_learning', 'enjoy_competition', 'avoid_losing')),
    emotional_intelligence_understanding TEXT,
    emotional_intelligence_hours_spent INTEGER,
    core_values TEXT[],
    internal_motivators TEXT[],
    external_motivators TEXT[],
    self_soothing_methods_healthy TEXT[],
    self_soothing_methods_unhealthy TEXT[],
    stress_management_positive TEXT[],
    stress_management_negative TEXT[],
    personal_identity TEXT,
    role_models TEXT[],
    admirable_qualities TEXT[],
    hobbies TEXT[],
    challenging_topics TEXT[],
    therapy_experience VARCHAR(20) CHECK (therapy_experience IN ('none', 'curious', 'positive', 'negative')),
    favorite_food TEXT,
    favorite_food_reason TEXT,
    conflict_resolution_approach TEXT,
    unique_challenges TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create messages table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    recipient_id INTEGER REFERENCES users(id),
    original_content TEXT NOT NULL,
    processed_content TEXT,
    tone VARCHAR(50),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

-- Create relationships table
CREATE TABLE relationships (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER REFERENCES users(id),
    user2_id INTEGER REFERENCES users(id),
    compatibility_score DECIMAL(5,2),
    interaction_count INTEGER DEFAULT 0,
    last_interaction TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user1_id, user2_id)
);

-- Create communication_suggestions table
CREATE TABLE communication_suggestions (
    id SERIAL PRIMARY KEY,
    relationship_id INTEGER REFERENCES relationships(id),
    suggestion TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    implemented_at TIMESTAMP WITH TIME ZONE
);