import { Flame } from 'lucide-react';

interface StreakCardProps {
  current: number;
  longest?: number;
}

export function StreakCard({ current, longest }: StreakCardProps) {
  const isHot = current > 0;
  return (
    <div className="rounded-2xl bg-bg-secondary border border-border p-5">
      <div className="flex items-center gap-4">
        <div
          className={`h-12 w-12 rounded-xl flex items-center justify-center ${
            isHot ? 'bg-accent/15 text-accent' : 'bg-bg-tertiary text-text-muted'
          }`}
        >
          <Flame size={24} className={isHot ? 'fill-accent/20' : ''} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-text-muted font-semibold">Streak</p>
          <p className="text-2xl font-bold font-display">
            {current} <span className="text-sm font-medium text-text-secondary">days</span>
          </p>
        </div>
      </div>
      {longest !== undefined && (
        <p className="mt-3 text-xs text-text-muted">
          Best: <span className="text-text-secondary font-medium">{longest} days</span>
        </p>
      )}
    </div>
  );
}
