import { useState, useEffect } from 'react';
import { Send, CornerDownRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  async function fetchComments() {
    try {
      const res = await api.get(`/api/comments/post/${postId}`);
      setComments(res.data.comments);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/api/comments', {
        postId,
        content: text.trim(),
        parentId: replyTo || undefined,
      });
      setText('');
      setReplyTo(null);
      fetchComments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p className="text-text-muted text-xs py-2">Loading comments...</p>;

  return (
    <div className="space-y-3">
      {comments.length === 0 && (
        <p className="text-text-muted text-xs">No comments yet. Be first.</p>
      )}

      {comments.map((c) => (
        <div key={c._id}>
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-border flex items-center justify-center text-xs text-text-muted shrink-0">
              {c.username.slice(0, 1)}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium text-text-primary">{c.username}</span>
                <span className="text-xs text-text-muted">
                  {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-text-primary mt-0.5">{c.content}</p>
              <button
                onClick={() => setReplyTo(replyTo === c._id ? null : c._id)}
                className="text-xs text-text-muted hover:text-accent mt-1 transition-colors"
              >
                {replyTo === c._id ? 'cancel reply' : 'reply'}
              </button>
            </div>
          </div>

          {/* Replies */}
          {c.replies && c.replies.length > 0 && (
            <div className="ml-8 mt-2 space-y-2">
              {c.replies.map((r) => (
                <div key={r._id} className="flex gap-2">
                  <CornerDownRight size={12} className="text-text-muted shrink-0 mt-1" />
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs font-medium text-text-primary">{r.username}</span>
                      <span className="text-xs text-text-muted">
                        {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-text-primary mt-0.5">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Input */}
      <form onSubmit={submit} className="flex gap-2 pt-2">
        {replyTo && (
          <span className="text-xs text-accent self-center shrink-0">↳ reply</span>
        )}
        <input
          className="flex-1 bg-background border border-border rounded-xl px-3 py-2 text-xs text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={300}
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="bg-accent hover:bg-accent-hover disabled:opacity-40 text-white rounded-xl px-3 py-2 transition-colors"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
