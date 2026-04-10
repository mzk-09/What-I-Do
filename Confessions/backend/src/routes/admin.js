const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');
const Report = require('../models/Report');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// GET /api/admin/reports
router.get('/reports', adminAuth, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'username')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports', error: err.message });
  }
});

// DELETE /api/admin/post/:id
router.delete('/post/:id', adminAuth, async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete post', error: err.message });
  }
});

// POST /api/admin/ban
router.post('/ban', adminAuth, async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    await User.findByIdAndUpdate(userId, { isBanned: true });
    res.json({ message: 'User banned' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to ban user', error: err.message });
  }
});

module.exports = router;
