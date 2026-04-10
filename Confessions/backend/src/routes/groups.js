const express = require('express');
const crypto = require('crypto');
const Group = require('../models/Group');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

function generateInviteCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

// POST /api/groups/create
router.post('/create', verifyToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length === 0) return res.status(400).json({ message: 'Group name required' });

    let inviteCode;
    let tries = 0;
    do {
      inviteCode = generateInviteCode();
      tries++;
    } while ((await Group.findOne({ inviteCode })) && tries < 10);

    const group = await Group.create({
      name: name.trim(),
      inviteCode,
      members: [req.user.id],
      createdBy: req.user.id,
    });

    res.status(201).json({ _id: group._id, name: group.name, inviteCode: group.inviteCode });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create group', error: err.message });
  }
});

// POST /api/groups/join
router.post('/join', verifyToken, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode) return res.status(400).json({ message: 'Invite code required' });

    const group = await Group.findOne({ inviteCode: inviteCode.trim().toUpperCase() });
    if (!group) return res.status(404).json({ message: 'Invalid invite code' });

    if (!group.members.some((m) => m.toString() === req.user.id)) {
      group.members.push(req.user.id);
      await group.save();
    }

    res.json({ _id: group._id, name: group.name, inviteCode: group.inviteCode });
  } catch (err) {
    res.status(500).json({ message: 'Failed to join group', error: err.message });
  }
});

// GET /api/groups
router.get('/', verifyToken, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user.id }).lean();
    res.json({ groups: groups.map((g) => ({ _id: g._id, name: g.name, inviteCode: g.inviteCode, memberCount: g.members.length })) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch groups', error: err.message });
  }
});

// GET /api/groups/:id/posts
router.get('/:id/posts', verifyToken, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.some((m) => m.toString() === req.user.id))
      return res.status(403).json({ message: 'Not a member' });

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const posts = await Post.find({ groupId: req.params.id })
      .populate('userId', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const postIds = posts.map((p) => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: '$postId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    commentCounts.forEach((c) => { countMap[c._id.toString()] = c.count; });

    const result = posts.map((p) => ({
      _id: p._id,
      content: p.content,
      username: p.userId ? p.userId.username : 'Anonymous',
      likesCount: p.likes.length,
      liked: p.likes.some((id) => id.toString() === req.user.id),
      commentsCount: countMap[p._id.toString()] || 0,
      groupId: p.groupId,
      createdAt: p.createdAt,
    }));

    res.json({ posts: result, page, hasMore: posts.length === limit });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch group posts', error: err.message });
  }
});

module.exports = router;
