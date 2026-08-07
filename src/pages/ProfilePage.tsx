import { useState } from 'react';
import { LogOut, Edit3, Music2, Star, Clock, Dumbbell, Flame, TrendingUp } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { LevelBadge } from '@/components/LevelBadge';
import { XPProgress } from '@/components/XPProgress';
import { StatCard } from '@/components/StatCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { getLevelInfo } from '@/config/levels';
import { MUSIC_STYLES, ARTIST_INSPIRATIONS } from '@/config/onboarding';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { profile, logOut, updateProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(profile?.displayName ?? '');
  const [saving, setSaving] = useState(false);

  if (!profile) {
    return (
      <AppShell>
        <div className="h-40 skeleton rounded-2xl max-w-2xl" />
      </AppShell>
    );
  }

  const levelInfo = getLevelInfo(profile.level);
  const styles = profile.onboarding?.musicStyles ?? [];
  const inspirations = profile.onboarding?.inspirations ?? [];

  const handleSave = async () => {
    if (!editName.trim()) {
      toast.show('Display name cannot be empty.', 'error');
      return;
    }
    setSaving(true);
    await updateProfile({ displayName: editName.trim() });
    setSaving(false);
    setEditOpen(false);
    toast.show('Profile updated.', 'success');
  };

  const handleLogout = async () => {
    await logOut();
    navigate('/');
  };

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Profile header */}
        <div className="rounded-2xl bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-border p-6 animate-fade-up">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-accent to-red-700 flex items-center justify-center font-bold font-display text-4xl text-white shadow-xl shadow-accent/20 shrink-0">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold font-display">{profile.displayName}</h1>
              <p className="text-sm text-text-secondary">{profile.email}</p>
              <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                <LevelBadge level={profile.level} size="sm" />
                <div>
                  <p className="text-xs text-text-muted">Level {profile.level}</p>
                  <p className="text-sm font-semibold">{levelInfo.name}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" leftIcon={<Edit3 size={16} />} onClick={() => { setEditName(profile.displayName); setEditOpen(true); }}>
                Edit
              </Button>
              <Button variant="danger" size="sm" leftIcon={<LogOut size={16} />} onClick={handleLogout}>
                Log Out
              </Button>
            </div>
          </div>
          <div className="mt-6">
            <XPProgress xp={profile.xp} compact />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <StatCard icon={<Flame size={18} />} label="Current Streak" value={`${profile.currentStreak}d`} />
          <StatCard icon={<TrendingUp size={18} />} label="Longest Streak" value={`${profile.longestStreak}d`} />
          <StatCard icon={<Dumbbell size={18} />} label="Workouts" value={profile.totalWorkouts} />
          <StatCard icon={<Clock size={18} />} label="Training" value={`${profile.totalWorkoutMinutes}m`} />
        </div>

        {/* Music styles */}
        <div className="rounded-2xl bg-bg-secondary border border-border p-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Music2 size={18} className="text-accent" />
            <h2 className="font-semibold">Music Styles</h2>
          </div>
          {styles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {styles.map((s) => {
                const style = MUSIC_STYLES.find((m) => m.id === s);
                return (
                  <span key={s} className="px-3 py-1.5 rounded-lg bg-bg-tertiary text-sm font-medium">
                    {style?.label ?? s}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No styles selected yet.</p>
          )}
        </div>

        {/* Inspirational artists */}
        <div className="rounded-2xl bg-bg-secondary border border-border p-6 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-4">
            <Star size={18} className="text-xp" />
            <h2 className="font-semibold">Inspirational Artists</h2>
          </div>
          {inspirations.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {inspirations.map((id) => {
                const artist = ARTIST_INSPIRATIONS.find((a) => a.id === id);
                return (
                  <span key={id} className="px-3 py-1.5 rounded-lg bg-bg-tertiary text-sm font-medium">
                    {artist?.name ?? id}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-text-muted">No artists selected yet.</p>
          )}
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Display Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-border text-text focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button fullWidth loading={saving} onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  );
}
