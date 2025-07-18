
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

router.get('/', async (req, res) => {
  try {
    const [blogPosts] = await db.execute('SELECT * FROM blog_posts ORDER BY id DESC');
    res.json(blogPosts);
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// GET blog post by ID
router.get('/:id', async (req, res) => {
  try {
    const [blogPosts] = await db.execute('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
    if (blogPosts.length === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json(blogPosts[0]);
  } catch (error) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// POST new blog post
router.post('/', async (req, res) => {
  try {
    const { title, excerpt, content, author, publish_date, image, category, tags } = req.body;

    const cleanTags = parseIfStringArray(tags);

    const [result] = await db.execute(
      'INSERT INTO blog_posts (title, excerpt, content, author, publish_date, image, category, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [title, excerpt, content, author, publish_date, image, category, JSON.stringify(cleanTags)]
    );

    const [newBlogPost] = await db.execute('SELECT * FROM blog_posts WHERE id = ?', [result.insertId]);
    res.status(201).json(newBlogPost[0]);
  } catch (error) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// PUT update blog post
router.put('/:id', async (req, res) => {
  try {
    const { title, excerpt, content, author, publish_date, image, category, tags } = req.body;

    const cleanTags = parseIfStringArray(tags);

    await db.execute(
      'UPDATE blog_posts SET title = ?, excerpt = ?, content = ?, author = ?, publish_date = ?, image = ?, category = ?, tags = ? WHERE id = ?',
      [title, excerpt, content, author, publish_date, image, category, JSON.stringify(cleanTags), req.params.id]
    );

    const [updatedBlogPost] = await db.execute('SELECT * FROM blog_posts WHERE id = ?', [req.params.id]);
    res.json(updatedBlogPost[0]);
  } catch (error) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// DELETE blog post
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Blog post not found' });
    }
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

export default router;
