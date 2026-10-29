import { TrendingUp, Activity, Flame, Music, Award, Zap, Clock } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { getLevelInfo, getXpProgress } from '@/config/levels';
import { LevelBadge } from '@/components/LevelBadge';

export function ProgressPage() {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <AppShell>
        <div className="space-y-4">
          <div className="h-10 w-48 skeleton rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="h-32 skeleton rounded-2xl" />
            <div className="h-32 skeleton rounded-2xl" />
            <div className="h-32 skeleton rounded-2xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  const levelInfo = getLevelInfo(profile.level);
  const xpProgress = getXpProgress(profile.xp);

  // Generate weekly activity mock data from workout count
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const seedBase = profile.totalWorkouts;
  const weekData = days.map((d, i) => {
    const val = ((seedBase + i * 3) % 7) * (i === 6 ? 1.5 : 1);
    return { day: d, minutes: Math.round(val * 2) };
  });
  const maxMinutes = Math.max(...weekData.map((d) => d.minutes), 10);

  const stats = [
    { icon: TrendingUp, label: 'Total XP', value: profile.xp, color: 'text-xp' },
    { icon: Activity, label: 'Workouts', value: profile.totalWorkouts, color: 'text-accent' },
    { icon: Clock, label: 'Minutes Trained', value: profile.totalWorkoutMinutes, color: 'text-blue-400' },
    { icon: Flame, label: 'Current Streak', value: profile.currentStreak, color: 'text-orange-400' },
  ];

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display">Your Progress</h1>
              <p className="text-text-secondary text-sm">Track your vocal journey over time.</p>
            </div>
          </div>
        </div>

        {/* Level progress card */}
        <div className="rounded-2xl bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-border p-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-4 mb-5">
            <LevelBadge level={profile.level} size="lg" />
            <div className="flex-1">
              <p className="text-xs uppercase tracking-widest text-text-muted font-semibold">Current Level</p>
              <h2 className="text-xl font-bold font-display">{levelInfo.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold font-display text-xp">{xpProgress.current}</p>
              <p className="text-xs text-text-muted">/ {xpProgress.needed} XP</p>
            </div>
          </div>
          <div className="h-3 rounded-full bg-bg overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-xp transition-all duration-700"
              style={{ width: `${xpProgress.percent}%` }}
            />
          </div>
          {xpProgress.nextLevel && (
            <p className="text-xs text-text-muted mt-2 text-center">
              {xpProgress.needed - xpProgress.current} XP until {xpProgress.nextLevel.name}
            </p>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl bg-bg-secondary border border-border p-5">
              <div className="flex items-center gap-2 mb-3">
                <stat.icon size={16} className={stat.color} />
                <span className="text-xs uppercase tracking-widest text-text-muted font-semibold">{stat.label}</span>
              </div>
              <p className={`text-3xl font-bold font-display tabular-nums ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Weekly activity chart */}
        <div className="rounded-2xl bg-bg-secondary border border-border p-6 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-5">
            <Activity size={18} className="text-accent" />
            <h3 className="font-semibold">This Week's Activity</h3>
          </div>
          <div className="flex items-end justify-between gap-3 h-40">
            {weekData.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-accent/40 to-accent transition-all duration-500"
                    style={{ height: `${(d.minutes / maxMinutes) * 100}%`, minHeight: d.minutes > 0 ? '8px' : '2px' }}
                  />
                </div>
                <span className="text-xs text-text-muted font-medium">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* XP milestones */}
        <div className="rounded-2xl bg-bg-secondary border border-border p-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center gap-2 mb-5">
            <Zap size={18} className="text-xp" />
            <h3 className="font-semibold">Level Milestones</h3>
          </div>
          <div className="space-y-3">
            {[
              { level: 1, name: 'Garage Rookie', minXp: 0, icon: Music },
              { level: 2, name: 'Club Singer', minXp: 100, icon: Activity },
              { level: 3, name: 'Stage Warrior', minXp: 300, icon: TrendingUp },
              { level: 4, name: 'Touring Vocalist', minXp: 600, icon: Flame },
              { level: 5, name: 'Arena Hero', minXp: 1000, icon: Award },
              { level: 6, name: 'Vocal Legend', minXp: 1600, icon: Award },
            ].map((milestone) => {
              const reached = profile.xp >= milestone.minXp;
              const Icon = milestone.icon;
              return (
                <div
                  key={milestone.level}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    reached ? 'bg-accent/5 border border-accent/15' : 'bg-bg-tertiary/50'
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                      reached ? 'bg-accent/20 text-accent' : 'bg-white/5 text-text-muted'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${reached ? 'text-text' : 'text-text-muted'}`}>
                      Level {milestone.level} — {milestone.name}
                    </p>
                    <p className="text-xs text-text-muted">{milestone.minXp} XP required</p>
                  </div>
                  {reached ? (
                    <span className="text-xs font-bold text-success px-2 py-1 rounded-lg bg-success/10">Reached</span>
                  ) : (
                    <span className="text-xs font-medium text-text-muted px-2 py-1 rounded-lg bg-white/5">Locked</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
