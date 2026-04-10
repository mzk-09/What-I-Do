const express = require('express');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Group = require('../models/Group');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const { postLimiter } = require('../middleware/rateLimiter');
const { containsProfanity } = require('../utils/profanityFilter');

const router = express.Router();

function formatPost(post, currentUserId) {
  return {
    _id: post._id,
    content: post.content,
    username: post.userId ? post.userId.username : 'Anonymous',
    likesCount: post.likes.length,
    liked: currentUserId ? post.likes.some((id) => id.toString() === currentUserId) : false,
    commentsCount: post.commentsCount || 0,
    groupId: post.groupId,
    isPublic: post.isPublic,
    createdAt: post.createdAt,
  };
}

// GET /api/posts — public feed
router.get('/', verifyToken, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isPublic: true })
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
      ...formatPost({ ...p, commentsCount: countMap[p._id.toString()] || 0 }, req.user.id),
    }));

    res.json({ posts: result, page, hasMore: posts.length === limit });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts', error: err.message });
  }
});

// GET /api/posts/trending
router.get('/trending', verifyToken, async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const posts = await Post.find({ isPublic: true, createdAt: { $gte: since } })
      .populate('userId', 'username')
      .lean();

    const postIds = posts.map((p) => p._id);
    const commentCounts = await Comment.aggregate([
      { $match: { postId: { $in: postIds } } },
      { $group: { _id: '$postId', count: { $sum: 1 } } },
    ]);
    const countMap = {};
    commentCounts.forEach((c) => { countMap[c._id.toString()] = c.count; });

    const sorted = posts
      .sort((a, b) => b.likes.length - a.likes.length)
      .slice(0, 10)
      .map((p) => formatPost({ ...p, commentsCount: countMap[p._id.toString()] || 0 }, req.user.id));

    res.json({ posts: sorted });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trending', error: err.message });
  }
});

// POST /api/posts
router.post('/', verifyToken, postLimiter, async (req, res) => {
  try {
    const { content, groupId, isPublic } = req.body;

    if (!content || content.trim().length === 0)
      return res.status(400).json({ message: 'Content is required' });
    if (content.length > 300)
      return res.status(400).json({ message: 'Content exceeds 300 characters' });
    if (containsProfanity(content))
      return res.status(400).json({ message: 'Content contains prohibited language' });

    const user = await User.findById(req.user.id);
    if (!user || user.isBanned) return res.status(403).json({ message: 'Account banned' });

    if (groupId) {
      const group = await Group.findById(groupId);
      if (!group) return res.status(404).json({ message: 'Group not found' });
      if (!group.members.some((m) => m.toString() === req.user.id))
        return res.status(403).json({ message: 'Not a member of this group' });
    }

    const post = await Post.create({
      content: content.trim(),
      userId: req.user.id,
      groupId: groupId || null,
      isPublic: groupId ? false : (isPublic !== false),
    });

    res.status(201).json({ message: 'Posted!', postId: post._id });
  } catch (err) {
    res.status(500).json({ message: 'Failed to post', error: err.message });
  }
});

// POST /api/posts/:id/like
router.post('/:id/like', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const idx = post.likes.findIndex((id) => id.toString() === req.user.id);
    if (idx === -1) {
      post.likes.push(req.user.id);
    } else {
      post.likes.splice(idx, 1);
    }
    await post.save();

    res.json({ liked: idx === -1, likesCount: post.likes.length });
  } catch (err) {
    res.status(500).json({ message: 'Failed to like', error: err.message });
  }
});

module.exports = router;
