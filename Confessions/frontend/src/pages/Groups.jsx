import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Copy, Plus, LogIn, Users } from 'lucide-react';
import ConfessionCard from '../components/ConfessionCard';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [groupPosts, setGroupPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const [newGroupName, setNewGroupName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    fetchGroups();
  }, []);

  async function fetchGroups() {
    try {
      const res = await api.get('/api/groups');
      setGroups(res.data.groups);
    } catch {
      toast.error('Failed to load groups');
    }
  }

  async function createGroup(e) {
    e.preventDefault();
    try {
      const res = await api.post('/api/groups/create', { name: newGroupName });
      toast.success(`Group "${res.data.name}" created! Code: ${res.data.inviteCode}`);
      setNewGroupName('');
      setShowCreate(false);
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    }
  }

  async function joinGroup(e) {
    e.preventDefault();
    try {
      const res = await api.post('/api/groups/join', { inviteCode: joinCode });
      toast.success(`Joined "${res.data.name}"!`);
      setJoinCode('');
      setShowJoin(false);
      fetchGroups();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid invite code');
    }
  }

  async function openGroup(group) {
    setActiveGroup(group);
    setLoadingPosts(true);
    try {
      const res = await api.get(`/api/groups/${group._id}/posts`);
      setGroupPosts(res.data.posts);
    } catch {
      toast.error('Failed to load group posts');
    } finally {
      setLoadingPosts(false);
    }
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code).then(() => toast.success('Invite code copied!'));
  }

  if (activeGroup) {
    return (
      <div className="px-4 pt-4">
        <button onClick={() => setActiveGroup(null)} className="text-text-muted hover:text-accent text-sm mb-4 flex items-center gap-1">
          ← Back to Groups
        </button>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">#{activeGroup.name}</h2>
          <button onClick={() => copyCode(activeGroup.inviteCode)} className="text-xs text-text-muted hover:text-accent flex items-center gap-1">
            <Copy size={12} /> {activeGroup.inviteCode}
          </button>
        </div>
        <div className="space-y-3">
          {loadingPosts ? (
            <div className="text-center py-8">
              <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : groupPosts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">🤫</div>
              <p className="text-text-muted text-sm">No confessions in this group yet.</p>
            </div>
          ) : (
            groupPosts.map((p) => <ConfessionCard key={p._id} post={p} />)
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-text-primary">Groups</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowJoin((v) => !v); setShowCreate(false); }}
            className="flex items-center gap-1 text-sm text-text-muted hover:text-accent transition-colors"
          >
            <LogIn size={16} /> Join
          </button>
          <button
            onClick={() => { setShowCreate((v) => !v); setShowJoin(false); }}
            className="flex items-center gap-1 text-sm bg-accent hover:bg-accent-hover text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus size={16} /> Create
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={createGroup} className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
          <h3 className="text-sm font-medium text-text-primary">Create Group</h3>
          <input
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent"
            placeholder="Group name"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white text-sm py-2 rounded-xl transition-colors">
            Create
          </button>
        </form>
      )}

      {/* Join form */}
      {showJoin && (
        <form onSubmit={joinGroup} className="bg-card border border-border rounded-xl p-4 mb-4 space-y-3">
          <h3 className="text-sm font-medium text-text-primary">Join Group</h3>
          <input
            className="w-full bg-background border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent uppercase"
            placeholder="Invite code (e.g. NIGHT1)"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            required
          />
          <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-white text-sm py-2 rounded-xl transition-colors">
            Join
          </button>
        </form>
      )}

      {/* Groups list */}
      {groups.length === 0 ? (
        <div className="text-center py-16">
          <Users size={40} className="mx-auto text-text-muted mb-3" />
          <p className="text-text-muted text-sm">You haven't joined any groups yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((g) => (
            <button
              key={g._id}
              onClick={() => openGroup(g)}
              className="w-full bg-card border border-border hover:border-accent/40 rounded-xl p-4 text-left transition-all group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-text-primary group-hover:text-accent transition-colors">#{g.name}</p>
                  <p className="text-xs text-text-muted mt-0.5">{g.memberCount} members</p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); copyCode(g.inviteCode); }}
                  className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
                >
                  <Copy size={12} /> {g.inviteCode}
                </button>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
