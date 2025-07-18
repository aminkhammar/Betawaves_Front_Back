import express from 'express';
import db from '../db.js';

const router = express.Router();


// GET /api/team-members
router.get('/', async (req, res) => {
  try {
    const [teamMembers] = await db.execute('SELECT * FROM team_members ORDER BY id DESC');
    res.json(teamMembers);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// GET /api/team-members/:id
router.get('/:id', async (req, res) => {
  try {
    const [teamMembers] = await db.execute('SELECT * FROM team_members WHERE id = ?', [req.params.id]);
    if (teamMembers.length === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json(teamMembers[0]);
  } catch (error) {
    console.error('Error fetching team member:', error);
    res.status(500).json({ error: 'Failed to fetch team member' });
  }
});

// POST /api/team-members
router.post('/', async (req, res) => {
  try {
   const { name, position, bio, image, linkedin_url } = req.body;

const [result] = await db.execute(
  'INSERT INTO team_members (name, position, bio, image, linkedin_url) VALUES (?, ?, ?, ?, ?)',
  [
    name,
    position,
    bio,
    image,
    linkedin_url || null,
  ]
);

const [newTeamMember] = await db.execute('SELECT * FROM team_members WHERE id = ?', [result.insertId]);
    res.status(201).json(newTeamMember[0]);
  } catch (error) {
    console.error('Error creating team member:', error);
    res.status(500).json({ error: 'Failed to create team member' });
  }
});

// PUT /api/team-members/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, position, bio, image, linkedin_url } = req.body;
    
    await db.execute(
      'UPDATE team_members SET name = ?, position = ?, bio = ?, image = ?, linkedin_url = ? WHERE id = ?',
      [name, position, bio, image, linkedin_url, req.params.id]
    );
    
    const [updatedTeamMember] = await db.execute('SELECT * FROM team_members WHERE id = ?', [req.params.id]);
    res.json(updatedTeamMember[0]);
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

// DELETE /api/team-members/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM team_members WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Team member not found' });
    }
    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});


export default router;

