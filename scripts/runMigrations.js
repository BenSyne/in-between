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

async function indexExists(client, indexName) {
  const result = await client.query(
    "SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = $1)",
    [indexName]
  );
  return result.rows[0].exists;
}

function splitSqlStatements(sql) {
  const statements = [];
  let currentStatement = '';
  let inQuote = false;
  let inDollarQuote = false;
  let dollarQuoteTag = '';

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1] || '';

    if (char === "'" && !inDollarQuote) {
      inQuote = !inQuote;
    } else if (char === '$' && nextChar === '$' && !inQuote) {
      if (!inDollarQuote) {
        inDollarQuote = true;
        dollarQuoteTag = '$$';
        i++; // Skip next $
      } else if (sql.substr(i, dollarQuoteTag.length) === dollarQuoteTag) {
        inDollarQuote = false;
        i += dollarQuoteTag.length - 1; // Skip to end of closing tag
      }
    } else if (char === ';' && !inQuote && !inDollarQuote) {
      statements.push(currentStatement.trim());
      currentStatement = '';
      continue;
    }

    currentStatement += char;
  }

  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements;
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
        
        const statements = splitSqlStatements(sql);
        
        for (let statement of statements) {
          const tableMatch = statement.match(/CREATE TABLE (\w+)/i);
          if (tableMatch) {
            const tableName = tableMatch[1];
            const exists = await tableExists(client, tableName);
            if (exists) {
              console.log(`Table ${tableName} already exists, skipping...`);
              continue;
            }
          }
          
          const indexMatch = statement.match(/CREATE INDEX (\w+)/i);
          if (indexMatch) {
            const indexName = indexMatch[1];
            const exists = await indexExists(client, indexName);
            if (exists) {
              console.log(`Index ${indexName} already exists, skipping...`);
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