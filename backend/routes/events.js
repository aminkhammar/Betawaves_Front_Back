
import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/events
router.get('/', async (req, res) => {
  try {
    const [events] = await db.execute('SELECT * FROM events ORDER BY date DESC');
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  try {
    const [events] = await db.execute('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(events[0]);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// POST /api/events
router.post('/', async (req, res) => {
  try {
    const { title, description, date, time, location, type, image, registration_url } = req.body;
    
    const [result] = await db.execute(
      'INSERT INTO events (title, description, date, time, location, type, image, registration_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, description, date, time, location, type, image, registration_url]
    );
    
    const [newEvent] = await db.execute('SELECT * FROM events WHERE id = ?', [result.insertId]);
    res.status(201).json(newEvent[0]);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// PUT /api/events/:id
router.put('/:id', async (req, res) => {
  try {
    const { title, description, date, time, location, type, image, registration_url } = req.body;
    
    await db.execute(
      'UPDATE events SET title = ?, description = ?, date = ?, time = ?, location = ?, type = ?, image = ?, registration_url = ? WHERE id = ?',
      [title, description, date, time, location, type, image, registration_url, req.params.id]
    );
    
    const [updatedEvent] = await db.execute('SELECT * FROM events WHERE id = ?', [req.params.id]);
    res.json(updatedEvent[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM events WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});


export default router;

