import type { StageVisualType } from '@/config/workouts';

interface StageVisualProps {
  type: StageVisualType;
  active: boolean;
}

export function StageVisual({ type, active }: StageVisualProps) {
  if (!active) return null;

  switch (type) {
    case 'lip-trill':
      return <LipTrillVisual />;
    case 'humming':
      return <HummingVisual />;
    case 'siren':
      return <SirenVisual />;
    case 'vowel':
      return <VowelVisual />;
    case 'sequence':
      return <SequenceVisual />;
    default:
      return null;
  }
}

function VisualContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-48 flex items-center justify-center overflow-hidden">
      {children}
    </div>
  );
}

function LipTrillVisual() {
  return (
    <VisualContainer>
      <div className="relative flex items-center justify-center">
        <div className="absolute h-32 w-32 rounded-full bg-accent/10 animate-ripple" />
        <div className="absolute h-32 w-32 rounded-full bg-accent/10 animate-ripple" style={{ animationDelay: '0.5s' }} />
        <div className="absolute h-32 w-32 rounded-full bg-accent/10 animate-ripple" style={{ animationDelay: '1s' }} />
        <div className="relative h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center animate-breathe">
          <span className="text-3xl font-bold text-accent">brrr</span>
        </div>
      </div>
    </VisualContainer>
  );
}

function HummingVisual() {
  return (
    <VisualContainer>
      <div className="relative flex items-center justify-center">
        <div className="absolute h-28 w-28 rounded-full bg-amber-500/10 animate-breathe" />
        <div className="absolute h-36 w-36 rounded-full bg-amber-500/5 animate-breathe" style={{ animationDelay: '0.4s' }} />
        <div className="relative h-16 w-16 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-600/20 flex items-center justify-center animate-breathe">
          <span className="text-2xl font-bold text-amber-500">mmm</span>
        </div>
      </div>
    </VisualContainer>
  );
}

function SirenVisual() {
  return (
    <VisualContainer>
      <div className="relative h-40 w-full max-w-xs flex items-center justify-center">
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" style={{ top: '40%' }} />
        <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" style={{ top: '60%' }} />
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-accent to-red-600 shadow-lg shadow-accent/30 animate-siren" />
      </div>
    </VisualContainer>
  );
}

function VowelVisual() {
  return (
    <VisualContainer>
      <div className="relative flex items-center justify-center">
        <div className="relative h-24 w-24 rounded-full bg-accent/15 flex items-center justify-center animate-vowel-pulse">
          <span className="text-4xl font-bold font-display text-accent">AH</span>
        </div>
      </div>
    </VisualContainer>
  );
}

function SequenceVisual() {
  return (
    <VisualContainer>
      <div className="flex items-center justify-center gap-3">
        {['mmm', 'ah', '~', 'AH'].map((label, i) => (
          <div
            key={i}
            className="h-12 w-12 rounded-full bg-accent/15 flex items-center justify-center animate-breathe"
            style={{ animationDelay: `${i * 0.3}s` }}
          >
            <span className="text-sm font-bold text-accent">{label}</span>
          </div>
        ))}
      </div>
    </VisualContainer>
  );
}
