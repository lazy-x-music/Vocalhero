import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, TrendingUp, Trophy, User } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/train', label: 'Train', icon: Dumbbell },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/achievements', label: 'Achievements', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: User },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border bg-bg-secondary h-screen sticky top-0">
      <div className="px-6 py-6 border-b border-border">
        <NavLink to="/dashboard" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-accent to-red-700 flex items-center justify-center font-bold font-display text-white text-lg shadow-lg shadow-accent/20">
            V
          </div>
          <div>
            <p className="font-bold font-display text-base leading-none">Vocal Hero</p>
            <p className="text-[10px] text-text-muted uppercase tracking-widest mt-1">Train. Level Up.</p>
          </div>
        </NavLink>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent-soft text-accent border border-accent/20'
                  : 'text-text-secondary hover:text-text hover:bg-white/5 border border-transparent'
              }`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-text-muted">v0.1 Foundation</p>
      </div>
    </aside>
  );
}
