require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Use the DATABASE_URL as is, without modifying the database name
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function tableExists(client, tableName) {
  const result = await client.query(
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)",
    [tableName]
  );
  return result.rows[0].exists;
}

async function indexExists(client, indexName) {
  const result = await client.query(
    "SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = $1)",
    [indexName]
  );
  return result.rows[0].exists;
}

async function runMigration() {
  let client;
  try {
    console.log('Attempting to connect to the database...');
    console.log('Connection string:', process.env.DATABASE_URL);
    client = await pool.connect();
    console.log('Connected successfully');

    const migrationFile = path.join(__dirname, 'migrations', '001_initial_schema.sql');
    console.log('Reading migration file:', migrationFile);
    const migrationSQL = fs.readFileSync(migrationFile, 'utf8');

    // Split the SQL into individual statements
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim() !== '');

    console.log('Beginning transaction...');
    await client.query('BEGIN');

    for (let statement of statements) {
      // Extract table name from CREATE TABLE statements
      const tableMatch = statement.match(/CREATE TABLE (\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const exists = await tableExists(client, tableName);
        if (exists) {
          console.log(`Table ${tableName} already exists, skipping...`);
          continue;
        }
      }

      // Extract index name from CREATE INDEX statements
      const indexMatch = statement.match(/CREATE INDEX (\w+)/i);
      if (indexMatch) {
        const indexName = indexMatch[1];
        const exists = await indexExists(client, indexName);
        if (exists) {
          console.log(`Index ${indexName} already exists, skipping...`);
          continue;
        }
      }

      console.log('Executing statement:', statement.substring(0, 50) + '...');
      await client.query(statement);
    }

    console.log('Committing transaction...');
    await client.query('COMMIT');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error details:', error);
    if (client) {
      console.log('Rolling back transaction...');
      await client.query('ROLLBACK');
    }
  } finally {
    if (client) {
      console.log('Releasing client...');
      client.release();
    }
    console.log('Ending pool...');
    await pool.end();
  }
}

runMigration();