const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { verifyToken } = require('../middleware/auth');
const { containsProfanity } = require('../utils/profanityFilter');

const router = express.Router();

// POST /api/comments
router.post('/', verifyToken, async (req, res) => {
  try {
    const { postId, content, parentId } = req.body;

    if (!postId) return res.status(400).json({ message: 'postId required' });
    if (!content || content.trim().length === 0) return res.status(400).json({ message: 'Content required' });
    if (content.length > 300) return res.status(400).json({ message: 'Content exceeds 300 characters' });
    if (containsProfanity(content)) return res.status(400).json({ message: 'Content contains prohibited language' });

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      postId,
      userId: req.user.id,
      content: content.trim(),
      parentId: parentId || null,
    });

    res.status(201).json({ _id: comment._id, content: comment.content, createdAt: comment.createdAt });
  } catch (err) {
    res.status(500).json({ message: 'Failed to comment', error: err.message });
  }
});

// GET /api/posts/:id/comments
router.get('/post/:id', verifyToken, async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id })
      .populate('userId', 'username')
      .sort({ createdAt: 1 })
      .lean();

    const topLevel = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => c.parentId);

    const formatted = topLevel.map((c) => ({
      _id: c._id,
      content: c.content,
      username: c.userId ? c.userId.username : 'Anonymous',
      createdAt: c.createdAt,
      replies: replies
        .filter((r) => r.parentId.toString() === c._id.toString())
        .map((r) => ({
          _id: r._id,
          content: r.content,
          username: r.userId ? r.userId.username : 'Anonymous',
          createdAt: r.createdAt,
        })),
    }));

    res.json({ comments: formatted });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments', error: err.message });
  }
});

module.exports = router;
