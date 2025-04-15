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
    const [nomenclatures] = await pool.query('SELECT * FROM nomenclatures');
    res.json(nomenclatures);
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch nomenclatures' });
  }
});

router.post('/', authenticate, async (req, res) => {
  if (req.user.role !== 2 && req.user.role !== 3) {
    return res.status(403).json({ error: 'Managers or Admins only' });
  }
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  try {
    const [result] = await pool.query('INSERT INTO nomenclatures (name) VALUES (?)', [name]);
    res.status(201).json({ id: result.insertId, message: 'Nomenclature created' });
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Failed to create nomenclature' });
  }
});

module.exports = router;