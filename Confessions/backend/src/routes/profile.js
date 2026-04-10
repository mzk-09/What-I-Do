const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Group = require('../models/Group');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// GET /api/profile
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('username createdAt role').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const postsCount = await Post.countDocuments({ userId: req.user.id });
    const groups = await Group.find({ members: req.user.id }).select('name inviteCode').lean();

    res.json({
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
      postsCount,
      groups: groups.map((g) => ({ _id: g._id, name: g.name, inviteCode: g.inviteCode })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch profile', error: err.message });
  }
});

module.exports = router;
