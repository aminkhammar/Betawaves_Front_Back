import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET all collaborators
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM collaborators ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching collaborators:', err);
    res.status(500).json({ error: 'Failed to fetch collaborators' });
  }
});

// POST a new collaborator
router.post('/', async (req, res) => {
  try {
    const { id, name, logo, website } = req.body;

    if (!name || !logo || !website) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

   await db.execute(
  'INSERT INTO collaborators (name, logo, website) VALUES (?, ?, ?)',
  [name ?? null, logo ?? null, website ?? null]
);

   const [result] = await db.execute('SELECT LAST_INSERT_ID() as id');
const newId = result[0].id;
const [rows] = await db.execute('SELECT * FROM collaborators WHERE id = ?', [newId]);

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Error adding collaborator:', err);
    res.status(500).json({ error: 'Failed to add collaborator' });
  }
});

// PUT update collaborator
router.put('/:id', async (req, res) => {
  try {
    const { name, logo, website } = req.body;
    const { id } = req.params;

    await db.execute(
      'UPDATE collaborators SET name = ?, logo = ?, website = ? WHERE id = ?',
      [name, logo, website, id]
    );

    const [rows] = await db.execute('SELECT * FROM collaborators WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error('Error updating collaborator:', err);
    res.status(500).json({ error: 'Failed to update collaborator' });
  }
});

// DELETE a collaborator
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM collaborators WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Collaborator not found' });
    }

    res.json({ message: 'Collaborator deleted successfully' });
  } catch (err) {
    console.error('Error deleting collaborator:', err);
    res.status(500).json({ error: 'Failed to delete collaborator' });
  }
});

export default router;
