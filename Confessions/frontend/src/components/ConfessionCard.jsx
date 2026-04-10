import { useState } from 'react';
import { Heart, MessageCircle, Flag, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import toast from 'react-hot-toast';
import CommentSection from './CommentSection';

export default function ConfessionCard({ post, onLikeUpdate }) {
  const [liked, setLiked] = useState(post.liked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showComments, setShowComments] = useState(false);

  const initials = post.username ? post.username.slice(0, 2).toUpperCase() : 'AN';

  const colors = [
    'bg-purple-600', 'bg-blue-600', 'bg-pink-600',
    'bg-indigo-600', 'bg-teal-600', 'bg-rose-600',
  ];
  const colorIdx = post.username
    ? post.username.charCodeAt(0) % colors.length
    : 0;

  async function handleLike() {
    try {
      const res = await api.post(`/api/posts/${post._id}/like`);
      setLiked(res.data.liked);
      setLikesCount(res.data.likesCount);
      if (onLikeUpdate) onLikeUpdate(post._id, res.data);
    } catch {
      toast.error('Failed to like');
    }
  }

  async function handleReport() {
    try {
      await api.post('/api/report', { targetId: post._id, targetType: 'post', reason: 'User report' });
      toast.success('Reported');
    } catch {
      toast.error('Failed to report');
    }
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-4 transition-all hover:border-accent/30">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-full ${colors[colorIdx]} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{post.username}</p>
          <p className="text-xs text-text-muted">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
        {post.groupId && (
          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">group</span>
        )}
      </div>

      {/* Content */}
      <p className="text-text-primary text-sm leading-relaxed mb-4">{post.content}</p>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${
            liked ? 'text-rose-500' : 'text-text-muted hover:text-rose-400'
          }`}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <MessageCircle size={16} />
          <span>{post.commentsCount}</span>
          {showComments ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <button
          onClick={handleReport}
          className="ml-auto text-text-muted hover:text-rose-400 transition-colors"
          title="Report"
        >
          <Flag size={14} />
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-border">
          <CommentSection postId={post._id} />
        </div>
      )}
    </div>
  );
}
