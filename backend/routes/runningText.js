import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all companies
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM running_text_companies ORDER BY id ASC');
    res.json(rows.map(row => row.name));
  } catch (err) {
    console.error('Error fetching running text companies:', err);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// PUT (overwrite all)
router.put('/', async (req, res) => {
  const { companies } = req.body;

  if (!Array.isArray(companies)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute('DELETE FROM running_text_companies');
    
    for (const name of companies) {
      await connection.execute(
        'INSERT INTO running_text_companies (name) VALUES (?)',
        [name || '']
      );
    }

    await connection.commit();
    res.status(200).json({ message: 'Running text companies updated successfully' });
  } catch (err) {
    await connection.rollback();
    console.error('Error updating companies:', err);
    res.status(500).json({ error: 'Failed to update running text companies' });
  } finally {
    connection.release();
  }
});

export default router;
