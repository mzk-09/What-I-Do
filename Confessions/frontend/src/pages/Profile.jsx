import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Hash, Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/profile')
      .then((res) => setProfile(res.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  function handleLogout() {
    logout();
    navigate('/auth');
    toast.success('Logged out');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const initials = profile?.username?.slice(0, 2).toUpperCase() || 'AN';

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">Profile</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-text-muted hover:text-rose-400 transition-colors"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Avatar + username */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-4 text-center">
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-xl font-bold text-white mx-auto mb-3">
          {initials}
        </div>
        <h2 className="text-lg font-semibold text-text-primary">{profile?.username}</h2>
        {profile?.role === 'admin' && (
          <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full mt-1 inline-block">Admin</span>
        )}
        <div className="flex items-center justify-center gap-1.5 mt-2 text-xs text-text-muted">
          <Calendar size={12} />
          <span>Joined {profile?.createdAt ? format(new Date(profile.createdAt), 'MMM yyyy') : '—'}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-card border border-border rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-2 text-sm text-text-muted mb-1">
          <FileText size={14} />
          <span>Confessions posted</span>
        </div>
        <p className="text-2xl font-bold text-text-primary">{profile?.postsCount ?? 0}</p>
      </div>

      {/* Groups */}
      {profile?.groups?.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
            <Hash size={14} />
            <span>Your groups</span>
          </div>
          <div className="space-y-2">
            {profile.groups.map((g) => (
              <div key={g._id} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">#{g.name}</span>
                <span className="text-xs text-text-muted font-mono">{g.inviteCode}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {profile?.role === 'admin' && (
        <button
          onClick={() => navigate('/admin')}
          className="w-full mt-4 bg-card border border-accent/40 hover:border-accent text-accent text-sm py-3 rounded-xl transition-colors"
        >
          Open Admin Panel
        </button>
      )}
    </div>
  );
}
