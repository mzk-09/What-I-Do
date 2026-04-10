import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Users, PlusCircle, User } from 'lucide-react';
import { useState } from 'react';
import PostModal from './PostModal';

export default function Layout({ children }) {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/groups', icon: Users, label: 'Groups' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto">
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-card border-t border-border flex items-center justify-around py-3 z-50">
        {navItems.map(({ to, icon: Icon, label }, i) => {
          if (i === 1) {
            return (
              <div key="group-and-post" className="flex items-center gap-6">
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-0.5 text-xs transition-colors ${
                      isActive ? 'text-accent' : 'text-text-muted hover:text-text-primary'
                    }`
                  }
                >
                  <Icon size={22} />
                  <span>{label}</span>
                </NavLink>

                {/* Post button */}
                <button
                  onClick={() => setShowModal(true)}
                  className="bg-accent hover:bg-accent-hover text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-accent/30 transition-all active:scale-95 -mt-5"
                  aria-label="Post confession"
                >
                  <PlusCircle size={28} />
                </button>
              </div>
            );
          }
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 text-xs transition-colors ${
                  isActive ? 'text-accent' : 'text-text-muted hover:text-text-primary'
                }`
              }
            >
              <Icon size={22} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      {showModal && <PostModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
