import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db.js';

const router = express.Router();

// Ensure popup folder exists
const popupDir = 'public/uploads/popup';
if (!fs.existsSync(popupDir)) {
  fs.mkdirSync(popupDir, { recursive: true });
}

// Storage for popup image
const storage = multer.diskStorage({
  destination: popupDir,
  filename: (req, file, cb) => {
    const uniqueName = `popup-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// ✅ GET /api/popup
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM popup WHERE id = 1');
    if (rows.length === 0) return res.status(404).json({ error: 'Popup not found' });

    const popup = rows[0];
    res.json({
      id: popup.id,
      title: popup.title,
      subject: popup.subject,
      description: popup.description,
      link: popup.link,
      isActive: !!popup.is_active,
      image: popup.image_path,
    });
  } catch (err) {
    console.error('Error fetching popup:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ✅ POST /api/popup/update
router.post('/update', upload.single('image'), async (req, res) => {
  const { title, subject, description, link, isActive, existingImage } = req.body;
  const imagePath = req.file
    ? `/uploads/popup/${req.file.filename}`
    : existingImage || '';

  try {
   await db.execute(
  `REPLACE INTO popup (id, title, subject, description, link, is_active, image_path)
   VALUES (?, ?, ?, ?, ?, ?, ?)`,
  [
    1,
    title || null,
    subject || null,
    description || null,
    link || null,
    isActive === 'true',
    imagePath || null,
  ]
);


    res.json({ message: 'Popup updated successfully' });
  } catch (err) {
    console.error('Error updating popup:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
