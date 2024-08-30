require('dotenv').config();
const { pool } = require('../src/db');

async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT current_database()');
    console.log('Connected to database:', result.rows[0].current_database);
    client.release();
  } catch (err) {
    console.error('Error connecting to the database:', err);
  } finally {
    await pool.end();
  }
}

testConnection();