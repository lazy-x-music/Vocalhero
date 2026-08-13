import { ArrowUp, ArrowDown, Target } from 'lucide-react';

interface PitchIndicatorProps {
  cents: number;
  onTarget: boolean;
  targetNote: string;
  detectedNote: string | null;
  frequency: number | null;
}

const TOLERANCE_CENTS = 50;
const MAX_DISPLAY_CENTS = 200;

export function PitchIndicator({
  cents,
  onTarget,
  targetNote,
  detectedNote,
  frequency,
}: PitchIndicatorProps) {
  const clampedCents = Math.max(-MAX_DISPLAY_CENTS, Math.min(MAX_DISPLAY_CENTS, cents));
  const verticalOffset = (clampedCents / MAX_DISPLAY_CENTS) * 60;

  let status: 'high' | 'low' | 'target' | 'silent';
  let statusLabel: string;
  let statusColor: string;

  if (!frequency || frequency <= 0) {
    status = 'silent';
    statusLabel = 'LISTENING...';
    statusColor = 'text-text-muted';
  } else if (Math.abs(cents) <= TOLERANCE_CENTS) {
    status = 'target';
    statusLabel = 'ON TARGET';
    statusColor = 'text-success';
  } else if (cents > 0) {
    status = 'high';
    statusLabel = 'TOO HIGH';
    statusColor = 'text-accent';
  } else {
    status = 'low';
    statusLabel = 'TOO LOW';
    statusColor = 'text-blue-400';
  }

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Status label */}
      <div className={`h-7 flex items-center justify-center font-bold text-sm uppercase tracking-widest transition-colors ${statusColor}`}>
        {status === 'high' && <ArrowUp size={16} className="mr-1" />}
        {status === 'low' && <ArrowDown size={16} className="mr-1" />}
        {status === 'target' && <Target size={16} className="mr-1" />}
        {statusLabel}
      </div>

      {/* Visual indicator area */}
      <div className="relative h-44 w-44 my-2">
        {/* Scale lines */}
        <div className="absolute left-0 right-0 top-1/4 h-px bg-border" />
        <div className="absolute left-0 right-0 top-2/4 h-px bg-border-strong" />
        <div className="absolute left-0 right-0 top-3/4 h-px bg-border" />

        {/* Target zone */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-24 rounded-full bg-success/10 border border-success/30"
          style={{
            top: `calc(50% - ${TOLERANCE_CENTS / MAX_DISPLAY_CENTS * 60}px)`,
            height: `${(TOLERANCE_CENTS * 2 / MAX_DISPLAY_CENTS) * 60}px`,
          }}
        />

        {/* Target note */}
        <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
          <div className="text-center">
            <p className="text-3xl font-extrabold font-display text-text-secondary/40">{targetNote}</p>
          </div>
        </div>

        {/* User voice indicator */}
        {status !== 'silent' && (
          <div
            className="absolute left-1/2 -translate-x-1/2 transition-transform duration-100 ease-out z-20"
            style={{ transform: `translate(-50%, calc(-50% + ${-verticalOffset}px))` }}
          >
            <div
              className={`h-6 w-6 rounded-full transition-colors ${
                status === 'target'
                  ? 'bg-success shadow-lg shadow-success/40'
                  : status === 'high'
                  ? 'bg-accent shadow-lg shadow-accent/30'
                  : 'bg-blue-400 shadow-lg shadow-blue-400/30'
              }`}
            />
          </div>
        )}
      </div>

      {/* Detected note */}
      <div className="text-center min-h-[3rem]">
        {status !== 'silent' && detectedNote ? (
          <>
            <p className="text-xs uppercase tracking-widest text-text-muted font-semibold">Your Note</p>
            <p className="text-2xl font-bold font-display">{detectedNote}</p>
            <p className="text-xs text-text-muted tabular-nums">{Math.round(frequency!)} Hz</p>
          </>
        ) : (
          <p className="text-sm text-text-muted pt-2">Sing into your microphone</p>
        )}
      </div>
    </div>
  );
}
