import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        const res = await api.post('/api/auth/register', { email: email || undefined, password });
        login(res.data.token, { username: res.data.username, role: 'user' });
        toast.success(`Welcome, ${res.data.username}! 🎭`);
      } else {
        const payload = email ? { email, password } : { username, password };
        const res = await api.post('/api/auth/login', payload);
        login(res.data.token, { username: res.data.username, role: res.data.role });
        toast.success(`Back in the shadows, ${res.data.username} 👁️`);
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎭</div>
          <h1 className="text-3xl font-bold text-text-primary">Confessions</h1>
          <p className="text-text-muted text-sm mt-1">Your secrets, safe in the shadows</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-card border border-border rounded-xl p-1 mb-6">
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m
                  ? 'bg-accent text-white shadow'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Join'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'register' ? (
            <input
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              placeholder="Email (optional)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          ) : (
            <input
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
              placeholder="Email or username"
              value={email || username}
              onChange={(e) => {
                const v = e.target.value;
                if (v.includes('@')) { setEmail(v); setUsername(''); }
                else { setUsername(v); setEmail(''); }
              }}
            />
          )}

          <div className="relative">
            <input
              className="w-full bg-card border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors pr-11"
              placeholder="Password"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
              onClick={() => setShowPass((v) => !v)}
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {mode === 'register' && (
            <p className="text-text-muted text-xs px-1">
              ✨ A random anonymous username will be assigned to you automatically.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all active:scale-95 mt-2"
          >
            {loading ? '...' : mode === 'login' ? 'Enter the Shadows' : 'Become Anonymous'}
          </button>
        </form>
      </div>
    </div>
  );
}
