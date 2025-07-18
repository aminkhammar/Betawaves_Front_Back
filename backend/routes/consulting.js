import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all consulting entries
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM consulting ORDER BY id DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching consulting entries:', error);
    res.status(500).json({ error: 'Failed to fetch consulting data' });
  }
});

// GET single consulting entry
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM consulting WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching consulting item:', error);
    res.status(500).json({ error: 'Failed to fetch consulting item' });
  }
});

// POST new consulting
router.post('/', async (req, res) => {
  try {
    const { title, description, features, icon, eligibility, category, directUrl } = req.body;
    const [result] = await db.execute(
      `INSERT INTO consulting (title, description, features, icon, eligibility, category, direct_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        Array.isArray(features) ? JSON.stringify(features) : features,
        icon,
        eligibility,
        category,
        directUrl || null
      ]
    );
    const [newItem] = await db.execute('SELECT * FROM consulting WHERE id = ?', [result.insertId]);
    res.status(201).json(newItem[0]);
  } catch (error) {
    console.error('Error creating consulting entry:', error);
    res.status(500).json({ error: 'Failed to create consulting entry' });
  }
});

// PUT update consulting
router.put('/:id', async (req, res) => {
  try {
    const { title, description, features, icon, eligibility, category, directUrl } = req.body;
    await db.execute(
      `UPDATE consulting SET title = ?, description = ?, features = ?, icon = ?, 
        eligibility = ?, category = ?, direct_url = ? WHERE id = ?`,
      [
        title,
        description,
        Array.isArray(features) ? JSON.stringify(features) : features,
        icon,
        eligibility,
        category,
        directUrl || null,
        req.params.id
      ]
    );
    const [updatedItem] = await db.execute('SELECT * FROM consulting WHERE id = ?', [req.params.id]);
    res.json(updatedItem[0]);
  } catch (error) {
    console.error('Error updating consulting entry:', error);
    res.status(500).json({ error: 'Failed to update consulting entry' });
  }
});

// DELETE consulting entry
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM consulting WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Consulting entry not found' });
    res.json({ message: 'Consulting entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting consulting entry:', error);
    res.status(500).json({ error: 'Failed to delete consulting entry' });
  }
});

export default router;
