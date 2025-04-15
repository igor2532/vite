const express = require('express');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const router = express.Router();

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

router.get('/', authenticate, async (req, res) => {
  try {
    const [organizations] = await pool.query('SELECT * FROM organizations ORDER BY display_order');
    res.json(organizations);
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

router.post('/', authenticate, async (req, res) => {
  if (req.user.role !== 3) return res.status(403).json({ error: 'Admins only' });
  const { name, unp, address } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const [result] = await pool.query(
      'INSERT INTO organizations (name, unp, address, display_order) VALUES (?, ?, ?, (SELECT COALESCE(MAX(display_order), 0) + 1 FROM organizations))',
      [name, unp || null, address || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Organization created' });
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
 // if (req.user.role !== 3) return res.status(403).json({ error: 'Admins only' });
  const { id } = req.params;
  const { name, unp, address } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    await pool.query(
      'UPDATE organizations SET name = ?, unp = ?, address = ? WHERE id = ?',
      [name, unp || null, address || null, id]
    );
    res.json({ message: 'Organization updated' });
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  if (req.user.role !== 3) return res.status(403).json({ error: 'Admins only' });
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM organizations WHERE id = ?', [id]);
    res.json({ message: 'Organization deleted' });
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

router.post('/reorder', authenticate, async (req, res) => {
  //if (req.user.role !== 3) return res.status(403).json({ error: 'Admins only' });
  const { order } = req.body; // Массив [{id, display_order}]
  try {
    for (const { id, display_order } of order) {
      await pool.query('UPDATE organizations SET display_order = ? WHERE id = ?', [display_order, id]);
    }
    res.json({ message: 'Organizations reordered' });
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Failed to reorder organizations' });
  }
});

module.exports = router;