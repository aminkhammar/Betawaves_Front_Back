import express from 'express';
import db from '../db.js';

const router = express.Router();

function parseIfStringArray(input) {
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return Array.isArray(input) ? input : [];
}


// GET /api/resources
router.get('/', async (req, res) => {
  try {
    const [resources] = await db.execute('SELECT * FROM resources ORDER BY id DESC');
    res.json(resources);
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ error: 'Failed to fetch resources' });
  }
});

// GET /api/resources/:id
router.get('/:id', async (req, res) => {
  try {
    const [resources] = await db.execute('SELECT * FROM resources WHERE id = ?', [req.params.id]);
    if (resources.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json(resources[0]);
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ error: 'Failed to fetch resource' });
  }
});

// POST /api/resources
router.post('/', async (req, res) => {
  try {
    const { title, description, type, category, download_url, image, tags } = req.body;
    const cleanTags = parseIfStringArray(tags);

    const [result] = await db.execute(
      'INSERT INTO resources (title, description, type, category, download_url, image, tags) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, type, category, download_url, image, JSON.stringify(cleanTags)]
    );

    const [newResource] = await db.execute('SELECT * FROM resources WHERE id = ?', [result.insertId]);
    res.status(201).json(newResource[0]);
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ error: 'Failed to create resource' });
  }
});

// PUT /api/resources/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, description, type, category, download_url, image, tags } = req.body;
    const cleanTags = parseIfStringArray(tags);

    await db.execute(
      'UPDATE resources SET title = ?, description = ?, type = ?, category = ?, download_url = ?, image = ?, tags = ? WHERE id = ?',
      [title, description, type, category, download_url, image, JSON.stringify(cleanTags), req.params.id]
    );

    const [updatedResource] = await db.execute('SELECT * FROM resources WHERE id = ?', [req.params.id]);
    res.json(updatedResource[0]);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ error: 'Failed to update resource' });
  }
});


// DELETE /api/resources/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM resources WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ error: 'Failed to delete resource' });
  }
});


export default router;

