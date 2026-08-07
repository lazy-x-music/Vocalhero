import { Play, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface WorkoutCardProps {
  title: string;
  duration: number;
  onStart?: () => void;
  comingSoon?: boolean;
}

export function WorkoutCard({ title, duration, onStart, comingSoon }: WorkoutCardProps) {
  return (
    <div className="relative rounded-2xl bg-gradient-to-br from-bg-secondary to-bg-tertiary border border-border p-6 overflow-hidden group">
      <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-accent/10 blur-3xl group-hover:bg-accent/15 transition-colors" />
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-widest text-accent font-bold">Today's Mission</span>
        </div>
        <h3 className="text-2xl font-bold font-display mb-3">{title}</h3>
        <div className="flex items-center gap-2 text-text-secondary mb-5">
          <Clock size={16} />
          <span className="text-sm font-medium">{duration} minutes</span>
        </div>
        <Button onClick={onStart} leftIcon={<Play size={18} />} fullWidth>
          {comingSoon ? 'Coming Soon' : 'Start Mission'}
        </Button>
      </div>
    </div>
  );
}
