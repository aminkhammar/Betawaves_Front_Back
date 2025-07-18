import db from './db.js';

async function testConnection() {
  try {
    const [rows] = await db.query('SELECT NOW() AS time');
    console.log('MySQL Connected! Time:', rows[0].time);
  } catch (error) {
    console.error('MySQL connection failed:', error);
  }
}

testConnection();
