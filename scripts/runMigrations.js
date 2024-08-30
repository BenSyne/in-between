const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

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

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const migrationFiles = await fs.readdir(path.join(__dirname, '../migrations'));
    const sortedMigrationFiles = migrationFiles.sort();

    for (const file of sortedMigrationFiles) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(__dirname, '../migrations', file);
        const sql = await fs.readFile(filePath, 'utf-8');
        
        console.log(`Running migration: ${file}`);
        
        // Split the SQL into individual statements
        const statements = sql.split(';').filter(stmt => stmt.trim() !== '');
        
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
          
          await client.query(statement);
        }
        
        console.log(`Completed migration: ${file}`);
      }
    }

    await client.query('COMMIT');
    console.log('All migrations completed successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error running migrations:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();