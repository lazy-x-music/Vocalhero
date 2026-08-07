import { getLevelInfo } from '@/config/levels';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-9 w-9 text-sm',
  md: 'h-12 w-12 text-base',
  lg: 'h-16 w-16 text-xl',
};

export function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
  const info = getLevelInfo(level);
  return (
    <div
      className={`${sizeClasses[size]} relative flex items-center justify-center rounded-xl bg-gradient-to-br from-accent to-red-700 text-white font-bold font-display shadow-lg shadow-accent/30`}
      title={info.name}
    >
      <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
      {level}
    </div>
  );
}
