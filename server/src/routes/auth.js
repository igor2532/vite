const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
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

router.post('/register', async (req, res) => {
  const { email, password, fullName, position, role, organizationId } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, password, full_name, position, role_id, organization_id) VALUES (?, ?, ?, ?, (SELECT id FROM roles WHERE name = ?), ?)',
      [email, hashedPassword, fullName || null, position || null, role, organizationId]
    );
    res.status(201).json({ id: result.insertId, message: 'User registered' });
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
    //  return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const [roles] = await pool.query('SELECT name FROM roles WHERE id = ?', [user.role_id]);
    res.json({ token, role: roles[0].name, organizationId: user.organization_id });
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/users', authenticate, async (req, res) => {
 // if (req.user.role !== 3) return res.status(403).json({ error: 'Admins only' });
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.email, u.full_name, u.position, u.organization_id, o.name AS organization_name, r.name AS role
      FROM users u
      LEFT JOIN organizations o ON u.organization_id = o.id
      LEFT JOIN roles r ON u.role_id = r.id
    `);
    res.json(users);
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.put('/users/:id', authenticate, async (req, res) => {
  //if (req.user.role !== 3) return res.status(403).json({ error: 'Admins only' });
  const { id } = req.params;
  const { email, fullName, position, organizationId, role, password } = req.body;
  try {
    const updates = [];
    const values = [];
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (fullName) {
      updates.push('full_name = ?');
      values.push(fullName);
    }
    if (position) {
      updates.push('position = ?');
      values.push(position);
    }
    if (organizationId) {
      updates.push('organization_id = ?');
      values.push(organizationId);
    }
    if (role) {
      updates.push('role_id = (SELECT id FROM roles WHERE name = ?)');
      values.push(role);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashedPassword);
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }
    values.push(id);
    await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'User updated' });
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/users/:id', authenticate, async (req, res) => {
  if (req.user.role !== 3) return res.status(403).json({ error: 'Admins only' });
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error('Database Error:', error.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;