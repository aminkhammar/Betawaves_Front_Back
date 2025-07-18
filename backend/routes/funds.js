import express from 'express';
import db from '../db.js';

const router = express.Router();


function parseFund(row) {
  return {
    ...row,
    sectors: typeof row.sectors === 'string' ? JSON.parse(row.sectors) : row.sectors
  };
}

// GET /api/funds
router.get('/', async (req, res) => {
  try {
    const [funds] = await db.execute('SELECT * FROM funds ORDER BY id DESC');
    res.json(funds.map(parseFund)); // ✅ Parse each fund
  } catch (error) {
    console.error('Error fetching funds:', error);
    res.status(500).json({ error: 'Failed to fetch funds' });
  }
});

// GET /api/funds/:id
router.get('/:id', async (req, res) => {
  try {
    const [funds] = await db.execute('SELECT * FROM funds WHERE id = ?', [req.params.id]);
    if (funds.length === 0) {
      return res.status(404).json({ error: 'Fund not found' });
    }
    res.json(parseFund(funds[0])); // ✅ Parse the fund
  } catch (error) {
    console.error('Error fetching fund:', error);
    res.status(500).json({ error: 'Failed to fetch fund' });
  }
});

function ensureArray(input) {
  try {
    if (Array.isArray(input)) return input;
    const parsed = JSON.parse(input);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ✅ POST /api/funds
router.post('/', async (req, res) => {
  try {
    const { name, description, total_size, current_raise, target_companies, stage, sectors, status } = req.body;

    const cleanSectors = ensureArray(sectors);

    const [result] = await db.execute(
      'INSERT INTO funds (name, description, total_size, current_raise, target_companies, stage, sectors, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, description, total_size, current_raise, target_companies, stage, JSON.stringify(cleanSectors), status]
    );

    const [newFund] = await db.execute('SELECT * FROM funds WHERE id = ?', [result.insertId]);
    res.status(201).json(newFund[0]);
  } catch (error) {
    console.error('Error creating fund:', error);
    res.status(500).json({ error: 'Failed to create fund' });
  }
});


// ✅ PUT /api/funds/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, description, total_size, current_raise, target_companies, stage, sectors, status } = req.body;

    const cleanSectors = ensureArray(sectors);

    await db.execute(
      'UPDATE funds SET name = ?, description = ?, total_size = ?, current_raise = ?, target_companies = ?, stage = ?, sectors = ?, status = ? WHERE id = ?',
      [name, description, total_size, current_raise, target_companies, stage, JSON.stringify(cleanSectors), status, req.params.id]
    );

    const [updatedFund] = await db.execute('SELECT * FROM funds WHERE id = ?', [req.params.id]);
    res.json(updatedFund[0]);
  } catch (error) {
    console.error('Error updating fund:', error);
    res.status(500).json({ error: 'Failed to update fund' });
  }
});


// DELETE /api/funds/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM funds WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Fund not found' });
    }
    res.json({ message: 'Fund deleted successfully' });
  } catch (error) {
    console.error('Error deleting fund:', error);
    res.status(500).json({ error: 'Failed to delete fund' });
  }
});


export default router;

