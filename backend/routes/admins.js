import express from 'express';
import db from '../db.js';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// GET /api/admins → list all admins
router.get('/', async (req, res) => {
  try {
    const [admins] = await db.execute(
      'SELECT id, username, email, created_at FROM admins ORDER BY created_at DESC'
    );
    res.json(admins.map(admin => ({
      id: admin.id,
      username: admin.username,
      email: admin.email,
      createdAt: admin.created_at,
    })));
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});
// POST /api/admins → create admin
router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const [existing] = await db.execute('SELECT * FROM admins WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await db.execute(
      'INSERT INTO admins (id, username, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)',
      [id, username, email, hash, new Date()]
    );

    const [newAdmin] = await db.execute('SELECT id, username, email, created_at FROM admins WHERE id = ?', [id]);
    res.status(201).json(newAdmin[0]);
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

// DELETE /api/admins/:id → delete admin
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.execute('DELETE FROM admins WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin:', error);
    res.status(500).json({ error: 'Failed to delete admin' });
  }
});

// POST /api/admins/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM admins WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({
      message: 'Login successful',
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        createdAt: admin.created_at
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
