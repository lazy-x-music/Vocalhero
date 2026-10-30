import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Music, Zap, Star } from 'lucide-react';
import { RIFFS, type Riff } from '@/config/riffs';
import { RiffHighway, type HighwayResult } from '@/components/RiffHighway';
import { useAuth } from '@/context/AuthContext';
import { AppShell } from '@/components/layout/AppShell';
import { addXp } from '@/lib/userService';

export function RiffHighwayPage() {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const [selectedRiff, setSelectedRiff] = useState<Riff | null>(null);
  const [lastResult, setLastResult] = useState<{ riff: Riff; result: HighwayResult } | null>(null);

  const handleComplete = useCallback(
    async (result: HighwayResult) => {
      if (user && result.xpGained > 0) {
        await addXp(user.uid, result.xpGained);
        await refreshProfile();
      }
      if (selectedRiff) {
        setLastResult({ riff: selectedRiff, result });
      }
    },
    [user, refreshProfile, selectedRiff]
  );

  const handleExit = useCallback(() => {
    setSelectedRiff(null);
  }, []);

  // In-game view
  if (selectedRiff) {
    return (
      <RiffHighway
        riff={selectedRiff}
        onExit={handleExit}
        onComplete={handleComplete}
      />
    );
  }

  // Level selector view
  return (
    <AppShell>
      <div className="relative max-w-2xl mx-auto w-full">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] bg-accent/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex flex-col">
        {/* Header */}
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="animate-fade-up">
          <span className="text-xs uppercase tracking-widest text-accent font-bold flex items-center gap-2">
            <Music size={14} /> Riff Highway
          </span>
          <h1 className="text-4xl font-extrabold font-display mt-2 tracking-tight">
            RIFF HIGHWAY
          </h1>
          <p className="text-text-secondary mt-2">
            Sing along a scrolling neon highway. Match the notes as they hit the strike zone.
            Build streaks, multiply your score, earn stars.
          </p>
        </div>

        {/* Last result banner */}
        {lastResult && (
          <div className="mt-6 rounded-2xl bg-bg-secondary border border-border p-4 animate-fade-up flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <Star
                  key={i}
                  size={20}
                  className={i < lastResult.result.stars ? 'text-xp fill-xp' : 'text-text-muted'}
                />
              ))}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">{lastResult.riff.name}</p>
              <p className="text-xs text-text-muted">
                {lastResult.result.score.toLocaleString()} pts · {lastResult.result.accuracy}% accuracy
              </p>
            </div>
          </div>
        )}

        {/* Riff cards */}
        <div className="mt-8 space-y-3">
          {RIFFS.map((riff, i) => (
            <button
              key={riff.id}
              onClick={() => setSelectedRiff(riff)}
              className="w-full text-left rounded-2xl bg-bg-secondary border border-border p-5 hover:border-border-strong transition-all group animate-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.08}s` }}
            >
              <div className="flex items-center gap-4">
                {/* Color indicator */}
                <div
                  className="h-14 w-14 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${riff.color}20`,
                    border: `1px solid ${riff.color}40`,
                  }}
                >
                  <Play size={22} style={{ color: riff.color }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold font-display truncate">{riff.name}</h3>
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                      style={{
                        color: riff.difficulty === 'Easy' ? '#35C759' : riff.difficulty === 'Medium' ? '#F5C542' : '#E53935',
                        backgroundColor: riff.difficulty === 'Easy' ? 'rgba(53,199,89,0.15)' : riff.difficulty === 'Medium' ? 'rgba(245,197,66,0.15)' : 'rgba(229,57,53,0.15)',
                      }}
                    >
                      {riff.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mt-0.5 truncate">{riff.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                    <span>{riff.bpm} BPM</span>
                    <span className="w-1 h-1 rounded-full bg-text-muted" />
                    <span>{riff.notes.length} notes</span>
                    <span className="w-1 h-1 rounded-full bg-text-muted" />
                    <span className="flex items-center gap-1 text-xp">
                      <Zap size={12} /> +{riff.xpReward} XP
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-8 rounded-xl bg-bg-secondary/50 border border-border p-4 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-xs text-text-muted leading-relaxed">
            <span className="font-semibold text-text-secondary">How to play:</span> Allow microphone
            access, press Start Riff, and sing each note as it reaches the glowing strike zone at the
            bottom. Lower notes are on the left, higher notes on the right. Hold each note for its full
            duration to score. Build a streak for 2x and 4x score multipliers.
          </p>
        </div>
      </div>
      </div>
    </AppShell>
  );
}
