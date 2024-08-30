const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function dropAllTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get all table names
    const res = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' AND 
      tablename NOT IN ('spatial_ref_sys');
    `);

    // Drop each table
    for (let row of res.rows) {
      try {
        await client.query(`DROP TABLE IF EXISTS "${row.tablename}" CASCADE`);
        console.log(`Dropped table: ${row.tablename}`);
      } catch (error) {
        console.error(`Error dropping table ${row.tablename}:`, error.message);
      }
    }

    await client.query('COMMIT');
    console.log('All tables dropped successfully');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Error dropping tables:', e);
  } finally {
    client.release();
    await pool.end();
  }
}

dropAllTables();