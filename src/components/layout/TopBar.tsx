import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LevelBadge } from '@/components/LevelBadge';
import { getLevelInfo } from '@/config/levels';
import { Button } from '@/components/ui/Button';

export function TopBar() {
  const { profile, logOut } = useAuth();
  const levelInfo = profile ? getLevelInfo(profile.level) : null;

  return (
    <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="lg:hidden flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-red-700 flex items-center justify-center font-bold font-display text-white">
            V
          </div>
          <span className="font-bold font-display">Vocal Hero</span>
        </div>

        <div className="hidden lg:block" />

        {profile && (
          <div className="flex items-center gap-3">
            <Link to="/profile" className="flex items-center gap-2.5 group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold leading-tight">{profile.displayName}</p>
                {levelInfo && (
                  <p className="text-xs text-text-muted leading-tight">
                    Lvl {profile.level} · {levelInfo.name}
                  </p>
                )}
              </div>
              <LevelBadge level={profile.level} size="sm" />
            </Link>
            <Button variant="ghost" size="sm" onClick={logOut} leftIcon={<LogOut size={16} />}>
              <span className="hidden sm:inline">Log Out</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
