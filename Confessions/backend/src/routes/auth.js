const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateUsername } = require('../utils/generateUsername');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    { id: user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, deviceId } = req.body;

    if (email) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ message: 'Email already registered' });
    }

    let username;
    let tries = 0;
    do {
      username = generateUsername();
      tries++;
    } while ((await User.findOne({ username })) && tries < 10);

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await User.create({
      username,
      email: email || null,
      password: hashedPassword,
      deviceId: deviceId || null,
    });

    res.status(201).json({ token: signToken(user), username: user.username });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password required' });

    const user = await User.findOne(email ? { email } : { username });
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.isBanned) return res.status(403).json({ message: 'Account banned' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ token: signToken(user), username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

module.exports = router;
