import { getXpProgress } from '@/config/levels';

interface XPProgressProps {
  xp: number;
  compact?: boolean;
}

export function XPProgress({ xp, compact }: XPProgressProps) {
  const { current, needed, percent, level, nextLevel } = getXpProgress(xp);

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-text-secondary">XP</span>
          <span className="text-xs font-semibold text-xp">
            {nextLevel ? `${current} / ${needed}` : 'MAX'}
          </span>
        </div>
        <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-xp to-amber-300 transition-all duration-700 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted font-semibold">Experience</p>
          <p className="text-2xl font-bold font-display text-xp mt-0.5">
            {nextLevel ? `${current} / ${needed} XP` : 'Max Level'}
          </p>
        </div>
        {nextLevel && (
          <p className="text-sm text-text-secondary">
            {needed - current} XP to <span className="text-text font-semibold">{nextLevel.name}</span>
          </p>
        )}
      </div>
      <div className="h-3 rounded-full bg-bg-tertiary overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-xp via-amber-400 to-amber-300 transition-all duration-700 ease-out relative"
          style={{ width: `${percent}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}
