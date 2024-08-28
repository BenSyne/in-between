const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigrations() {
  let client;
  try {
    console.log('Attempting to connect to the database...');
    client = await pool.connect();
    console.log('Connected to the database successfully');
    
    // Read the migration file
    const migrationFile = await fs.readFile(path.join(__dirname, '../migrations/001_initial_schema.sql'), 'utf8');

    // Split the file into individual statements
    const statements = migrationFile.split(';').filter(stmt => stmt.trim() !== '');

    // Execute each statement
    for (let statement of statements) {
      await client.query(statement);
      console.log('Executed:', statement.substring(0, 50) + '...');
    }

    console.log('All migrations completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    console.error('Error details:', err.stack);
  } finally {
    if (client) {
      await client.release();
    }
    await pool.end();
  }
}

runMigrations();