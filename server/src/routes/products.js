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
    const [products] = await pool.query(`
      SELECT p.id, p.nomenclature_id, n.name AS nomenclature_name, p.price, p.quantity, p.organization_id, o.name AS organization_name
      FROM products p
      LEFT JOIN nomenclatures n ON p.nomenclature_id = n.id
      LEFT JOIN organizations o ON p.organization_id = o.id
    `);
    res.json(products);
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/', authenticate, async (req, res) => {
  if (req.user.role !== 2 && req.user.role !== 3) {
    return res.status(403).json({ error: 'Managers or Admins only' });
  }
  const { nomenclatureId, price, quantity, organizationId } = req.body;
  if (!nomenclatureId || !organizationId) {
    return res.status(400).json({ error: 'Nomenclature ID and Organization ID are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO products (nomenclature_id, price, quantity, organization_id) VALUES (?, ?, ?, ?)',
      [nomenclatureId, price, quantity, organizationId]
    );
    res.status(201).json({ id: result.insertId, message: 'Product created' });
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

module.exports = router;