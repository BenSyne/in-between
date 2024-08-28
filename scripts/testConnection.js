const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  let client;
  try {
    console.log('Attempting to connect to the database...');
    client = await pool.connect();
    console.log('Connected to the database successfully');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from database:', res.rows[0].now);
  } catch (err) {
    console.error('Connection failed:', err);
    console.error('Error details:', err.stack);
  } finally {
    if (client) {
      await client.release();
    }
    await pool.end();
  }
}

testConnection();