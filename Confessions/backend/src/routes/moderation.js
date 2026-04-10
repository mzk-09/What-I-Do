const express = require('express');
const Report = require('../models/Report');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/report
router.post('/', verifyToken, async (req, res) => {
  try {
    const { targetId, targetType, reason } = req.body;
    if (!targetId || !targetType) return res.status(400).json({ message: 'targetId and targetType required' });
    if (!['post', 'comment'].includes(targetType)) return res.status(400).json({ message: 'Invalid targetType' });

    await Report.create({ targetId, targetType, reportedBy: req.user.id, reason: reason || '' });
    res.status(201).json({ message: 'Reported successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to report', error: err.message });
  }
});

module.exports = router;
