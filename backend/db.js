import mysql from 'mysql2/promise';

const db = await mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',     // replace if needed
  database: 'betawaves_cms', // make sure this matches your DB name
  port: 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default db;
