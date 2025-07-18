import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/services - Get all services
router.get('/', async (req, res) => {
  try {
    const [services] = await db.execute('SELECT * FROM services ORDER BY id DESC');
    res.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// GET /api/services/:id - Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const [services] = await db.execute('SELECT * FROM services WHERE id = ?', [req.params.id]);
    if (services.length === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json(services[0]);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// POST /api/services - Create new service
router.post('/', async (req, res) => {
  try {
    const { title, description, features, icon, duration, eligibility, category, presentation_url } = req.body;
    
    const [result] = await db.execute(
      'INSERT INTO services (title, description, features, icon, duration, eligibility, category, presentation_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description,  Array.isArray(features) ? JSON.stringify(features) : features, icon, duration, eligibility, category, presentation_url]
    );
    
    const [newService] = await db.execute('SELECT * FROM services WHERE id = ?', [result.insertId]);
    res.status(201).json(newService[0]);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// PUT /api/services/:id - Update service
router.put('/:id', async (req, res) => {
  try {
    const { title, description, features, icon, duration, eligibility, category, presentation_url } = req.body;
    
    await db.execute(
      'UPDATE services SET title = ?, description = ?, features = ?, icon = ?, duration = ?, eligibility = ?, category = ?, presentation_url = ? WHERE id = ?',
      [title, description,  Array.isArray(features) ? JSON.stringify(features) : features, icon, duration, eligibility, category, presentation_url, req.params.id]
    );
    
    const [updatedService] = await db.execute('SELECT * FROM services WHERE id = ?', [req.params.id]);
    res.json(updatedService[0]);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// DELETE /api/services/:id - Delete service
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM services WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});


export default router;

