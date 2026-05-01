import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2, Ban, Flag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Admin() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchReports();
  }, [user]);

  async function fetchReports() {
    try {
      const res = await api.get('/api/admin/reports');
      setReports(res.data.reports);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }

  async function deletePost(postId) {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/api/admin/post/${postId}`);
      toast.success('Post deleted');
      setReports((prev) => prev.filter((r) => r.targetId !== postId));
    } catch {
      toast.error('Failed to delete');
    }
  }

  async function banUser(userId) {
    if (!window.confirm('Ban this user?')) return;
    try {
      await api.post('/api/admin/ban', { userId });
      toast.success('User banned');
    } catch {
      toast.error('Failed to ban');
    }
  }

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center gap-2 mb-4">
        <Flag size={18} className="text-accent" />
        <h1 className="text-xl font-bold text-text-primary">Admin Panel</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-muted">No reports yet. All clear! ✅</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r._id} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full capitalize">
                    {r.targetType}
                  </span>
                  <p className="text-xs text-text-muted mt-1">
                    Reported by <span className="text-text-primary">{r.reportedBy?.username || 'Unknown'}</span>{' '}
                    · {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {r.reason && (
                <p className="text-sm text-text-muted mb-3 italic">"{r.reason}"</p>
              )}

              <p className="text-xs text-text-muted mb-3 font-mono">
                Target ID: {r.targetId}
              </p>

              <div className="flex gap-2">
                {r.targetType === 'post' && (
                  <button
                    onClick={() => deletePost(r.targetId)}
                    className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 size={12} /> Delete Post
                  </button>
                )}
                <button
                  onClick={() => banUser(r.reportedBy?._id)}
                  className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Ban size={12} /> Ban Reporter
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
