import express from 'express';
import db from '../db.js';

const router = express.Router();


// GET /api/case-studies
router.get('/', async (req, res) => {
  try {
    const [caseStudies] = await db.execute('SELECT * FROM case_studies ORDER BY id DESC');
    res.json(caseStudies);
  } catch (error) {
    console.error('Error fetching case studies:', error);
    res.status(500).json({ error: 'Failed to fetch case studies' });
  }
});

// GET /api/case-studies/:id
router.get('/:id', async (req, res) => {
  try {
    const [caseStudies] = await db.execute('SELECT * FROM case_studies WHERE id = ?', [req.params.id]);
    if (caseStudies.length === 0) {
      return res.status(404).json({ error: 'Case study not found' });
    }
    res.json(caseStudies[0]);
  } catch (error) {
    console.error('Error fetching case study:', error);
    res.status(500).json({ error: 'Failed to fetch case study' });
  }
});

// Helper to ensure we don't double-stringify
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
router.post('/', async (req, res) => {
  try {
    const {
      company_name,
      industry,
      description,
      challenge,
      solution,
      results,
      image,
      testimonial,
      tags
    } = req.body;

    const cleanResults = parseIfStringArray(results);
    const cleanTags = parseIfStringArray(tags);
    const cleanTestimonial = typeof testimonial === 'string' ? JSON.parse(testimonial) : testimonial;

    const [result] = await db.execute(
      `INSERT INTO case_studies (company_name, industry, description, challenge, solution, results, image, testimonial, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        company_name,
        industry,
        description,
        challenge,
        solution,
        JSON.stringify(cleanResults),
        image,
        JSON.stringify(cleanTestimonial),
        JSON.stringify(cleanTags)
      ]
    );

    const [newCaseStudy] = await db.execute('SELECT * FROM case_studies WHERE id = ?', [result.insertId]);
    res.status(201).json(newCaseStudy[0]);
  } catch (error) {
    console.error('Error creating case study:', error);
    res.status(500).json({ error: 'Failed to create case study' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const {
      company_name,
      industry,
      description,
      challenge,
      solution,
      results,
      image,
      testimonial,
      tags
    } = req.body;

    const cleanResults = parseIfStringArray(results);
    const cleanTags = parseIfStringArray(tags);
    const cleanTestimonial = typeof testimonial === 'string' ? JSON.parse(testimonial) : testimonial;

    await db.execute(
      `UPDATE case_studies SET
        company_name = ?, industry = ?, description = ?, challenge = ?, solution = ?, results = ?, image = ?, testimonial = ?, tags = ?
       WHERE id = ?`,
      [
        company_name,
        industry,
        description,
        challenge,
        solution,
        JSON.stringify(cleanResults),
        image,
        JSON.stringify(cleanTestimonial),
        JSON.stringify(cleanTags),
        req.params.id
      ]
    );

    const [updatedCaseStudy] = await db.execute('SELECT * FROM case_studies WHERE id = ?', [req.params.id]);
    res.json(updatedCaseStudy[0]);
  } catch (error) {
    console.error('Error updating case study:', error);
    res.status(500).json({ error: 'Failed to update case study' });
  }
});

// DELETE /api/case-studies/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM case_studies WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Case study not found' });
    }
    res.json({ message: 'Case study deleted successfully' });
  } catch (error) {
    console.error('Error deleting case study:', error);
    res.status(500).json({ error: 'Failed to delete case study' });
  }
});

export default router;
