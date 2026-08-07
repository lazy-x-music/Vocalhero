import { NavLink } from 'react-router-dom';
import { Home, Dumbbell, TrendingUp, User } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/train', label: 'Train', icon: Dumbbell },
  { to: '/progress', label: 'Progress', icon: TrendingUp },
  { to: '/profile', label: 'Profile', icon: User },
];

export function MobileNavigation() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-bg-secondary/95 backdrop-blur-md border-t border-border">
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-colors ${
                isActive ? 'text-accent' : 'text-text-muted'
              }`
            }
          >
            <item.icon size={22} />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
