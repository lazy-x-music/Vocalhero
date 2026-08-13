import { useNavigate } from 'react-router-dom';
import { Dumbbell, Clock, TrendingUp, Flame, Music2, Sparkles } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { XPProgress } from '@/components/XPProgress';
import { LevelBadge } from '@/components/LevelBadge';
import { StreakCard } from '@/components/StreakCard';
import { StatCard } from '@/components/StatCard';
import { WorkoutCard } from '@/components/WorkoutCard';
import { getLevelInfo } from '@/config/levels';
import { useAuth } from '@/context/AuthContext';
import { MUSIC_STYLES } from '@/config/onboarding';

export function DashboardPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile) {
    return (
      <AppShell>
        <div className="space-y-4">
          <div className="h-10 w-64 skeleton rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-28 skeleton rounded-2xl" />
            <div className="h-28 skeleton rounded-2xl" />
            <div className="h-28 skeleton rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  const levelInfo = getLevelInfo(profile.level);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const topStyles = (profile.onboarding?.musicStyles ?? []).slice(0, 3);

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Greeting */}
        <div className="animate-fade-up">
          <p className="text-text-secondary text-sm font-medium">{greeting},</p>
          <h1 className="text-3xl sm:text-4xl font-bold font-display mt-0.5">{profile.displayName}</h1>
          <p className="text-text-secondary mt-2">Ready to train your voice?</p>
        </div>

        {/* Level + XP hero card */}
        <div className="rounded-2xl bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-border p-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-4 mb-6">
            <LevelBadge level={profile.level} size="lg" />
            <div>
              <p className="text-xs uppercase tracking-widest text-text-muted font-semibold">Level {profile.level}</p>
              <h2 className="text-xl font-bold font-display">{levelInfo.name}</h2>
            </div>
          </div>
          <XPProgress xp={profile.xp} />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <StreakCard current={profile.currentStreak} longest={profile.longestStreak} />
          <StatCard
            icon={<Dumbbell size={18} />}
            label="Workouts"
            value={profile.totalWorkouts}
            sub="All time"
          />
          <StatCard
            icon={<Clock size={18} />}
            label="Training"
            value={`${profile.totalWorkoutMinutes}m`}
            sub="Total minutes"
          />
          <StatCard
            icon={<TrendingUp size={18} />}
            label="Total XP"
            value={profile.xp}
            accent
          />
        </div>

        {/* Today's mission + side panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="lg:col-span-2">
            <WorkoutCard
              title="Voice Awakening"
              duration={10}
              onStart={() => navigate('/workout')}
            />
          </div>
          <div className="rounded-2xl bg-bg-secondary border border-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-xp" />
              <h3 className="font-semibold">Recent Progress</h3>
            </div>
            <p className="text-sm text-text-secondary">
              {profile.totalWorkouts === 0
                ? 'Your journey starts here. Complete your first workout to begin earning XP!'
                : `You've completed ${profile.totalWorkouts} workout${profile.totalWorkouts === 1 ? '' : 's'}. Keep the momentum going!`}
            </p>
            {topStyles.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Music2 size={14} className="text-text-muted" />
                  <p className="text-xs uppercase tracking-widest text-text-muted font-semibold">Your Styles</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topStyles.map((s) => {
                    const style = MUSIC_STYLES.find((m) => m.id === s);
                    return (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-lg bg-bg-tertiary text-text-secondary font-medium">
                        {style?.label ?? s}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Streak motivation */}
        {profile.currentStreak === 0 && (
          <div className="rounded-2xl border border-border bg-bg-secondary p-5 flex items-center gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Flame size={24} />
            </div>
            <div>
              <p className="font-semibold">No streak yet</p>
              <p className="text-sm text-text-secondary">Complete your first workout to start a streak. Every day counts.</p>
            </div>
          </div>
        )}
      </div>

    </AppShell>
  );
}
