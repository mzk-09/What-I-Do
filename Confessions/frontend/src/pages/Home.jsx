import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import ConfessionCard from '../components/ConfessionCard';
import { Flame, Clock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home() {
  const [tab, setTab] = useState('recent');
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      if (tab === 'trending') {
        const res = await api.get('/api/posts/trending');
        setPosts(res.data.posts);
        setHasMore(false);
      } else {
        const res = await api.get(`/api/posts?page=${currentPage}&limit=20`);
        if (reset) {
          setPosts(res.data.posts);
          setPage(2);
        } else {
          setPosts((prev) => [...prev, ...res.data.posts]);
          setPage((p) => p + 1);
        }
        setHasMore(res.data.hasMore);
      }
    } catch {
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasMore(true);
    fetchPosts(true);
  }, [tab]);

  return (
    <div className="px-4 pt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-text-primary">🎭 Confessions</h1>
        <button
          onClick={() => fetchPosts(true)}
          className="text-text-muted hover:text-accent transition-colors"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1 mb-4">
        <button
          onClick={() => setTab('recent')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'recent' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Clock size={14} /> Recent
        </button>
        <button
          onClick={() => setTab('trending')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'trending' ? 'bg-accent text-white' : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Flame size={14} /> Trending
        </button>
      </div>

      {/* Feed */}
      <div className="space-y-3">
        {posts.map((post) => (
          <ConfessionCard key={post._id} post={post} />
        ))}
      </div>

      {loading && (
        <div className="text-center py-6">
          <div className="inline-block w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && hasMore && tab === 'recent' && (
        <button
          onClick={() => fetchPosts(false)}
          className="w-full py-3 text-sm text-text-muted hover:text-accent transition-colors mt-2"
        >
          Load more
        </button>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">👁️</div>
          <p className="text-text-muted">Nothing here yet. Be the first to confess.</p>
        </div>
      )}
    </div>
  );
}
