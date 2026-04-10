import { useState, useEffect } from 'react';
import { X, Globe, Lock, ChevronDown } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function PostModal({ onClose, onPosted }) {
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const MAX = 300;
  const remaining = MAX - content.length;

  useEffect(() => {
    api.get('/api/groups').then((res) => setGroups(res.data.groups)).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/api/posts', {
        content: content.trim(),
        isPublic,
        groupId: !isPublic && selectedGroup ? selectedGroup : undefined,
      });
      toast.success('Confession posted 🔥');
      if (onPosted) onPosted();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-5 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">New Confession</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              className="w-full bg-background border border-border rounded-xl p-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent resize-none transition-colors"
              placeholder="What's on your mind? No one will know it's you..."
              rows={5}
              maxLength={MAX}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
            <span
              className={`absolute bottom-3 right-3 text-xs ${
                remaining <= 20 ? 'text-rose-400' : 'text-text-muted'
              }`}
            >
              {remaining}
            </span>
          </div>

          {/* Visibility toggle */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsPublic(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${
                isPublic
                  ? 'bg-accent text-white'
                  : 'bg-background border border-border text-text-muted hover:border-accent/50'
              }`}
            >
              <Globe size={14} /> Public
            </button>
            <button
              type="button"
              onClick={() => setIsPublic(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${
                !isPublic
                  ? 'bg-accent text-white'
                  : 'bg-background border border-border text-text-muted hover:border-accent/50'
              }`}
            >
              <Lock size={14} /> Private Group
            </button>
          </div>

          {/* Group dropdown */}
          {!isPublic && (
            <div className="relative">
              <select
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent appearance-none transition-colors"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">Select a group...</option>
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>{g.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !content.trim() || (!isPublic && !selectedGroup)}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-40 text-white font-medium py-3 rounded-xl transition-all active:scale-95"
          >
            {submitting ? 'Posting...' : 'Post Anonymously 🔒'}
          </button>
        </form>
      </div>
    </div>
  );
}
