const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret123'; // Use .env in production

// REGISTER
router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, name } = req.body;

    try {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ error: 'User already exists' });

      const hashed = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          passwordHash: hashed,
          name
        }
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// LOGIN
router.post('/login',
  body('email').isEmail(),
  body('password').exists(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.passwordHash) return res.status(401).json({ error: 'Invalid credentials' });

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.status(200).json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

module.exports = router;
