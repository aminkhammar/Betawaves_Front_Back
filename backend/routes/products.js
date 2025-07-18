
import express from 'express';
import db from '../db.js';

const router = express.Router();

function parseProduct(row) {
  return {
    ...row,
    features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features
  };
}

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const [products] = await db.execute('SELECT * FROM products ORDER BY id DESC');
    const parsedProducts = products.map(parseProduct);
    res.json(parsedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(parseProduct(products[0]));
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /api/products
function ensureArray(input) {
  try {
    if (Array.isArray(input)) return input;
    const parsed = JSON.parse(input);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// POST
router.post('/', async (req, res) => {
  const { name, description, category, price, features, image, status } = req.body;
  const cleanFeatures = ensureArray(features);

  try {
    const [result] = await db.execute(
      'INSERT INTO products (name, description, category, price, features, image, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, category, price, JSON.stringify(cleanFeatures), image, status]
    );
    const [newProduct] = await db.execute('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(newProduct[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});



// PUT /api/products/:id
router.put('/:id', async (req, res) => {
  try {
    const { name, description, category, price, features, image, status } = req.body;
    const cleanFeatures = ensureArray(features);
    await db.execute(
      'UPDATE products SET name = ?, description = ?, category = ?, price = ?, features = ?, image = ?, status = ? WHERE id = ?',
      [name, description, category, price,  JSON.stringify(cleanFeatures), image, status, req.params.id]
    );
    
    const [updatedProduct] = await db.execute('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json(parseProduct(updatedProduct[0]));
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// DELETE /api/products/:id
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});


export default router;

