import express from 'express';
import db from '../db.js';

const router = express.Router();


// GET /api/program-applications
// GET /api/program-applications
router.get('/', async (req, res) => {
  try {
    const [applications] = await db.execute(`
      SELECT 
        pa.*, 
        s.title AS program_title
      FROM program_applications pa
      LEFT JOIN services s ON pa.program_id = s.id
      ORDER BY pa.submitted_at DESC
    `);

    res.json(applications);
  } catch (error) {
    console.error('Error fetching program applications:', error);
    res.status(500).json({ error: 'Failed to fetch program applications' });
  }
});


// GET /api/program-applications/:id
router.get('/:id', async (req, res) => {
  try {
    const [applications] = await db.execute('SELECT * FROM program_applications WHERE id = ?', [req.params.id]);
    if (applications.length === 0) {
      return res.status(404).json({ error: 'Program application not found' });
    }
    res.json(applications[0]);
  } catch (error) {
    console.error('Error fetching program application:', error);
    res.status(500).json({ error: 'Failed to fetch program application' });
  }
});

// POST /api/program-applications
router.post('/', async (req, res) => {
  try {
    const { 
      program_id, 
      company_name, 
      email, 
      phone, 
      company_description, 
      submitted_at, 
      status 
    } = req.body;
    
    const [result] = await db.execute(
      'INSERT INTO program_applications (program_id, company_name, email, phone, company_description, submitted_at, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [program_id, company_name, email, phone, company_description, submitted_at || new Date(), status || 'pending']
    );
    
    const [newApplication] = await db.execute('SELECT * FROM program_applications WHERE id = ?', [result.insertId]);
    res.status(201).json(newApplication[0]);
  } catch (error) {
    console.error('Error creating program application:', error);
    res.status(500).json({ error: 'Failed to create program application' });
  }
});

// PUT /api/program-applications/:id
router.put('/:id', async (req, res) => {
  try {
    const { 
      program_id, 
      company_name,  
      email, 
      phone, 
      company_description, 
      submitted_at, 
      status 
    } = req.body;
    
    await db.execute(
      'UPDATE program_applications SET program_id = ?, company_name = ?, email = ?, phone = ?, company_description = ?, submitted_at = ?, status = ? WHERE id = ?',
      [program_id, company_name, email, phone, company_description, submitted_at, status, req.params.id]
    );
    
    const [updatedApplication] = await db.execute('SELECT * FROM program_applications WHERE id = ?', [req.params.id]);
    res.json(updatedApplication[0]);
  } catch (error) {
    console.error('Error updating program application:', error);
    res.status(500).json({ error: 'Failed to update program application' });
  }
});

// DELETE /api/program-applications/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM program_applications WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Program application not found' });
    }
    res.json({ message: 'Program application deleted successfully' });
  } catch (error) {
    console.error('Error deleting program application:', error);
    res.status(500).json({ error: 'Failed to delete program application' });
  }
});


export default router;
