import { useMemo } from 'react';
import {
  Trophy, Footprints, Dumbbell, Medal, Crown, Flame, CalendarCheck,
  Shield, Star, Award, Music, Sparkles, Guitar, Repeat, Clock, Gem, Lock,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuth } from '@/context/AuthContext';
import { ACHIEVEMENTS, type AchievementStats } from '@/config/achievements';

const ICONS: Record<string, typeof Trophy> = {
  footprints: Footprints,
  dumbbell: Dumbbell,
  medal: Medal,
  crown: Crown,
  flame: Flame,
  'calendar-check': CalendarCheck,
  shield: Shield,
  star: Star,
  award: Award,
  trophy: Trophy,
  music: Music,
  sparkles: Sparkles,
  guitar: Guitar,
  repeat: Repeat,
  clock: Clock,
  gem: Gem,
};

export function AchievementsPage() {
  const { profile } = useAuth();

  const stats: AchievementStats = useMemo(() => {
    const riffData = (() => {
      try {
        const raw = localStorage.getItem('vocal_hero_riff_scores');
        if (raw) return JSON.parse(raw) as { riffId: string; stars: number; accuracy: number }[];
      } catch { /* ignore */ }
      return [];
    })();

    return {
      totalWorkouts: profile?.totalWorkouts ?? 0,
      totalXp: profile?.xp ?? 0,
      level: profile?.level ?? 1,
      currentStreak: profile?.currentStreak ?? 0,
      longestStreak: profile?.longestStreak ?? 0,
      totalWorkoutMinutes: profile?.totalWorkoutMinutes ?? 0,
      riffScores: riffData,
      perfectRiffs: riffData.filter((r) => r.stars >= 3).length,
      bestRiffAccuracy: riffData.length > 0 ? Math.max(...riffData.map((r) => r.accuracy)) : 0,
      totalRiffsCompleted: riffData.length,
    };
  }, [profile]);

  const unlocked = ACHIEVEMENTS.filter((a) => a.condition(stats));
  const locked = ACHIEVEMENTS.filter((a) => !a.condition(stats));
  const unlockedXp = unlocked.reduce((sum, a) => sum + a.xpReward, 0);

  const categories = ['Workouts', 'Riffs', 'Streaks', 'Levels', 'Special'];
  const byCategory = (cat: string) => {
    const all = [...unlocked, ...locked];
    return all.filter((a) => a.category === cat);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Trophy size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-display">Achievements</h1>
              <p className="text-text-secondary text-sm">Unlock badges as you train and improve.</p>
            </div>
          </div>
        </div>

        {/* Summary card */}
        <div className="rounded-2xl bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-border p-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-widest text-text-muted font-semibold">Unlocked</p>
              <p className="text-3xl font-bold font-display">
                {unlocked.length}
                <span className="text-text-muted text-lg"> / {ACHIEVEMENTS.length}</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-widest text-text-muted font-semibold">Bonus XP Earned</p>
              <p className="text-2xl font-bold font-display text-xp">+{unlockedXp}</p>
            </div>
          </div>
          <div className="h-3 rounded-full bg-bg overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-xp transition-all duration-700"
              style={{ width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Achievement categories */}
        {categories.map((category, catIdx) => {
          const items = byCategory(category);
          if (items.length === 0) return null;
          return (
            <div key={category} className="animate-fade-up" style={{ animationDelay: `${0.1 + catIdx * 0.05}s` }}>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-text-muted mb-3">{category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((achievement) => {
                  const isUnlocked = achievement.condition(stats);
                  const Icon = isUnlocked ? (ICONS[achievement.icon] ?? Trophy) : Lock;
                  return (
                    <div
                      key={achievement.id}
                      className={`rounded-2xl border p-5 transition-all ${
                        isUnlocked
                          ? 'bg-bg-secondary border-accent/20'
                          : 'bg-bg-secondary/50 border-border opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                            isUnlocked ? 'bg-accent/15 text-accent' : 'bg-white/5 text-text-muted'
                          }`}
                        >
                          <Icon size={22} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold text-sm ${isUnlocked ? 'text-text' : 'text-text-muted'}`}>
                            {achievement.name}
                          </h4>
                          <p className="text-xs text-text-secondary mt-0.5">{achievement.description}</p>
                          {isUnlocked ? (
                            <span className="inline-block mt-2 text-xs font-bold text-xp px-2 py-0.5 rounded-lg bg-xp/10">
                              +{achievement.xpReward} XP
                            </span>
                          ) : (
                            <span className="inline-block mt-2 text-xs text-text-muted px-2 py-0.5 rounded-lg bg-white/5">
                              {achievement.xpReward} XP reward
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Motivational footer */}
        {locked.length > 0 && (
          <div className="rounded-2xl border border-border bg-bg-secondary p-5 flex items-center gap-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="h-12 w-12 rounded-xl bg-xp/10 flex items-center justify-center text-xp shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <p className="font-semibold">{locked.length} achievements still locked</p>
              <p className="text-sm text-text-secondary">Keep training to unlock them all and earn bonus XP.</p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
