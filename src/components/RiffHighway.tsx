import { useRef, useEffect, useCallback, useState } from 'react';
import { Mic, X, Volume2, Music, ArrowLeft, Headphones } from 'lucide-react';
import { PitchDetector } from '@/lib/pitchDetector';
import { audioService } from '@/lib/audioService';
import { noteStringToFrequency, frequencyToNoteString, centsDifference } from '@/lib/noteUtils';
import type { Riff } from '@/config/riffs';
import { Button } from '@/components/ui/Button';

interface RiffHighwayProps {
  riff: Riff;
  onExit: () => void;
  onComplete: (result: HighwayResult) => void;
}

export interface HighwayResult {
  score: number;
  accuracy: number;
  xpGained: number;
  stars: number;
  maxStreak: number;
  totalHits: number;
  totalNotes: number;
}

type Phase = 'select' | 'playing' | 'finished';

const TOLERANCE_CENTS = 80;
const HIT_ZONE_Y = 0.82;
const NOTE_SPEED_PX_PER_SEC = 220;
const LEAD_TIME_SEC = 3.0;
const UI_UPDATE_MS = 80;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

interface NoteState {
  note: string;
  freq: number;
  time: number;
  duration: number;
  hit: boolean;
  missed: boolean;
  processed: boolean;
  guidePlayed: boolean;
}

export function RiffHighway({ riff, onExit, onComplete }: RiffHighwayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const detectorRef = useRef<PitchDetector | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef(0);
  const notesRef = useRef<NoteState[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const currentFreqRef = useRef(0);
  const currentLevelRef = useRef(0);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const maxStreakRef = useRef(0);
  const hitsRef = useRef(0);
  const phaseRef = useRef<Phase>('select');
  const lastUiUpdateRef = useRef(0);
  const guideToneRef = useRef(true);
  const previewPlayingRef = useRef(false);
  const micInitializedRef = useRef(false);

  const [phase, setPhase] = useState<Phase>('select');
  const [micError, setMicError] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [inputLevel, setInputLevel] = useState(0);
  const [result, setResult] = useState<HighwayResult | null>(null);
  const [guideToneOn, setGuideToneOn] = useState(true);
  const [isListeningPreview, setIsListeningPreview] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const allFreqs = riff.notes.map((n) => noteStringToFrequency(n.note));
  const minFreq = Math.min(...allFreqs) * 0.9;
  const maxFreq = Math.max(...allFreqs) * 1.1;

  const lastRiffNote = riff.notes[riff.notes.length - 1];
  const riffTotalDuration = lastRiffNote ? lastRiffNote.time + lastRiffNote.duration + 1 : 10;

  const freqToX = useCallback(
    (freq: number, canvasW: number) => {
      if (freq <= 0) return canvasW / 2;
      const minLog = Math.log2(minFreq);
      const maxLog = Math.log2(maxFreq);
      const logFreq = Math.log2(Math.max(freq, minFreq));
      const t = (logFreq - minLog) / (maxLog - minLog);
      return Math.max(20, Math.min(canvasW - 20, t * canvasW));
    },
    [minFreq, maxFreq]
  );

  /**
   * Ensure the microphone is already running before the game starts.
   * Called once — keeps the mic alive across retries.
   */
  const ensureMicrophone = useCallback(async () => {
    if (micInitializedRef.current && detectorRef.current?.isRunning) return;
    if (micInitializedRef.current && detectorRef.current) {
      detectorRef.current.stop();
      detectorRef.current = null;
    }

    await audioService.ensureContext();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone API not available in this browser.');
    }

    const detector = new PitchDetector();
    await detector.start((freq: number, level: number) => {
      currentFreqRef.current = freq;
      currentLevelRef.current = level;
    });
    detectorRef.current = detector;
    micInitializedRef.current = true;
  }, []);

  const listenToRiff = useCallback(async () => {
    if (previewPlayingRef.current) return;
    await audioService.ensureContext();
    const ctx = audioService.context;
    if (!ctx) return;

    previewPlayingRef.current = true;
    setIsListeningPreview(true);

    const startAt = ctx.currentTime + 0.2;
    audioService.playRiffMelody(riff.notes, startAt);
    audioService.playClickTrack(riff.bpm, startAt, riffTotalDuration);

    const totalMs = (riffTotalDuration + 0.5) * 1000;
    setTimeout(() => {
      previewPlayingRef.current = false;
      setIsListeningPreview(false);
    }, totalMs);
  }, [riff, riffTotalDuration]);

  // Canvas drawing and game loop
  const animateHighway = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    const draw = () => {
      if (phaseRef.current !== 'playing') return;

      const W = canvas.width;
      const H = canvas.height;
      const now = (performance.now() - startTimeRef.current) / 1000;

      ctx2d.fillStyle = '#0a0a0f';
      ctx2d.fillRect(0, 0, W, H);

      ctx2d.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx2d.lineWidth = 1;
      for (let i = 0; i <= 6; i++) {
        const x = (i / 6) * W;
        ctx2d.beginPath();
        ctx2d.moveTo(x, 0);
        ctx2d.lineTo(x, H);
        ctx2d.stroke();
      }

      for (let i = 0; i <= 8; i++) {
        const y = (i / 8) * H;
        ctx2d.strokeStyle = `rgba(255,255,255,${i === Math.round(HIT_ZONE_Y * 8) ? 0.15 : 0.04})`;
        ctx2d.beginPath();
        ctx2d.moveTo(0, y);
        ctx2d.lineTo(W, y);
        ctx2d.stroke();
      }

      const hitY = HIT_ZONE_Y * H;
      const hitZoneHeight = 50;
      const gradient = ctx2d.createLinearGradient(0, hitY - hitZoneHeight / 2, 0, hitY + hitZoneHeight / 2);
      gradient.addColorStop(0, 'rgba(229, 57, 53, 0)');
      gradient.addColorStop(0.5, 'rgba(229, 57, 53, 0.12)');
      gradient.addColorStop(1, 'rgba(229, 57, 53, 0)');
      ctx2d.fillStyle = gradient;
      ctx2d.fillRect(0, hitY - hitZoneHeight / 2, W, hitZoneHeight);

      ctx2d.strokeStyle = riff.color;
      ctx2d.lineWidth = 2;
      ctx2d.shadowBlur = 12;
      ctx2d.shadowColor = riff.color;
      ctx2d.beginPath();
      ctx2d.moveTo(0, hitY);
      ctx2d.lineTo(W, hitY);
      ctx2d.stroke();
      ctx2d.shadowBlur = 0;

      const notes = notesRef.current;
      for (const noteState of notes) {
        const progress = (now - (noteState.time - LEAD_TIME_SEC)) / LEAD_TIME_SEC;
        const y = progress * hitY;
        const noteX = freqToX(noteState.freq, W);
        const noteHeight = Math.max(20, noteState.duration * NOTE_SPEED_PX_PER_SEC * 0.3);

        if (y < -noteHeight || y > H + 50) continue;

        if (
          guideToneRef.current &&
          !noteState.guidePlayed &&
          Math.abs(y - hitY) < hitZoneHeight
        ) {
          noteState.guidePlayed = true;
          audioService.playGuideTone(noteState.note, Math.round(noteState.duration * 1000));
        }

        if (!noteState.processed) {
          const distToHitZone = Math.abs(y - hitY);
          const inHitZone = distToHitZone < hitZoneHeight / 2;

          if (inHitZone) {
            const userFreq = currentFreqRef.current;
            if (userFreq > 0) {
              const diff = Math.abs(centsDifference(noteState.freq, userFreq));
              if (diff <= TOLERANCE_CENTS) {
                noteState.hit = true;
                noteState.processed = true;
                hitsRef.current++;
                streakRef.current++;
                maxStreakRef.current = Math.max(maxStreakRef.current, streakRef.current);
                const mult = streakRef.current >= 20 ? 4 : streakRef.current >= 10 ? 2 : 1;
                scoreRef.current += 100 * mult;

                for (let p = 0; p < 12; p++) {
                  const angle = (p / 12) * Math.PI * 2;
                  particlesRef.current.push({
                    x: noteX,
                    y: hitY,
                    vx: Math.cos(angle) * (80 + Math.random() * 60),
                    vy: Math.sin(angle) * (80 + Math.random() * 60) - 30,
                    life: 1,
                    color: riff.color,
                  });
                }

                void audioService.playUiClick();
              }
            }
          } else if (y > hitY + hitZoneHeight / 2 + 5) {
            noteState.missed = true;
            noteState.processed = true;
            streakRef.current = 0;
          }
        }

        const alpha = noteState.hit ? 0.3 : noteState.missed ? 0.2 : 1;
        ctx2d.globalAlpha = alpha;

        if (noteState.hit) {
          ctx2d.fillStyle = '#35C759';
          ctx2d.shadowBlur = 20;
          ctx2d.shadowColor = '#35C759';
        } else if (noteState.missed) {
          ctx2d.fillStyle = '#6B6B72';
          ctx2d.shadowBlur = 0;
        } else {
          ctx2d.fillStyle = riff.color;
          ctx2d.shadowBlur = 10;
          ctx2d.shadowColor = riff.color;
        }

        const capsuleW = 36;
        ctx2d.beginPath();
        ctx2d.roundRect(noteX - capsuleW / 2, y - noteHeight / 2, capsuleW, noteHeight, 8);
        ctx2d.fill();

        if (!noteState.hit && !noteState.missed) {
          ctx2d.shadowBlur = 0;
          ctx2d.fillStyle = '#fff';
          ctx2d.font = 'bold 12px Inter, sans-serif';
          ctx2d.textAlign = 'center';
          ctx2d.textBaseline = 'middle';
          ctx2d.fillText(noteState.note, noteX, y);
        }

        ctx2d.shadowBlur = 0;
        ctx2d.globalAlpha = 1;
      }

      ctx2d.strokeStyle = `${riff.color}33`;
      ctx2d.lineWidth = 3;
      for (let i = 0; i < notes.length - 1; i++) {
        const n1 = notes[i];
        const n2 = notes[i + 1];
        const progress1 = (now - (n1.time - LEAD_TIME_SEC)) / LEAD_TIME_SEC;
        const progress2 = (now - (n2.time - LEAD_TIME_SEC)) / LEAD_TIME_SEC;
        const y1 = progress1 * hitY;
        const y2 = progress2 * hitY;
        const x1 = freqToX(n1.freq, W);
        const x2 = freqToX(n2.freq, W);

        if (y1 > -50 && y2 < H + 50) {
          ctx2d.beginPath();
          ctx2d.moveTo(x1, y1);
          ctx2d.lineTo(x2, y2);
          ctx2d.stroke();
        }
      }

      const userFreq = currentFreqRef.current;
      const level = currentLevelRef.current;
      if (userFreq > 0 && level > 0.01) {
        const avatarX = freqToX(userFreq, W);
        ctx2d.shadowBlur = 25;
        ctx2d.shadowColor = '#fff';
        ctx2d.fillStyle = '#fff';
        ctx2d.beginPath();
        ctx2d.arc(avatarX, hitY, 10, 0, Math.PI * 2);
        ctx2d.fill();

        ctx2d.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx2d.lineWidth = 2;
        ctx2d.beginPath();
        ctx2d.arc(avatarX, hitY, 16, 0, Math.PI * 2);
        ctx2d.stroke();
        ctx2d.shadowBlur = 0;
      }

      const dt = 1 / 60;
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 200 * dt;
        p.life -= dt * 1.5;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx2d.globalAlpha = p.life;
        ctx2d.fillStyle = p.color;
        ctx2d.shadowBlur = 8;
        ctx2d.shadowColor = p.color;
        ctx2d.beginPath();
        ctx2d.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        ctx2d.fill();
      }
      ctx2d.globalAlpha = 1;
      ctx2d.shadowBlur = 0;

      const uiNow = performance.now();
      if (uiNow - lastUiUpdateRef.current > UI_UPDATE_MS) {
        lastUiUpdateRef.current = uiNow;
        setScore(scoreRef.current);
        setStreak(streakRef.current);
        setMultiplier(streakRef.current >= 20 ? 4 : streakRef.current >= 10 ? 2 : 1);
        setInputLevel(level);
        setDetectedNote(userFreq > 0 ? frequencyToNoteString(userFreq) : null);
      }

      const lastNote = notes[notes.length - 1];
      if (lastNote && now > lastNote.time + lastNote.duration + 2) {
        phaseRef.current = 'finished';
        audioService.stopClickTrack();
        const totalNotes = notes.length;
        const accuracy = Math.round((hitsRef.current / totalNotes) * 100);
        const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0;
        const res: HighwayResult = {
          score: scoreRef.current,
          accuracy,
          xpGained: riff.xpReward,
          stars,
          maxStreak: maxStreakRef.current,
          totalHits: hitsRef.current,
          totalNotes,
        };
        setResult(res);
        setPhase('finished');
        onComplete(res);
        return;
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
  }, [riff, freqToX, onComplete]);

  const startRiff = useCallback(async () => {
    setIsStarting(true);
    setMicError(null);
    try {
      await ensureMicrophone();
    } catch (err) {
      let msg = 'Could not access microphone.';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          msg = 'Microphone permission denied. Please allow access in your browser settings.';
        } else if (err.name === 'NotFoundError') {
          msg = 'No microphone found on this device.';
        } else {
          msg = err.message;
        }
      }
      setMicError(msg);
      setIsStarting(false);
      return;
    }

    const ctx = audioService.context;
    if (!ctx) {
      setIsStarting(false);
      return;
    }

    notesRef.current = riff.notes.map((n) => ({
      note: n.note,
      freq: noteStringToFrequency(n.note),
      time: n.time,
      duration: n.duration,
      hit: false,
      missed: false,
      processed: false,
      guidePlayed: false,
    }));

    scoreRef.current = 0;
    streakRef.current = 0;
    maxStreakRef.current = 0;
    hitsRef.current = 0;
    particlesRef.current = [];
    setResult(null);

    setPhase('playing');
    phaseRef.current = 'playing';
    startTimeRef.current = performance.now();
    setIsStarting(false);

    const audioStartAt = ctx.currentTime + 0.1;
    audioService.playClickTrack(riff.bpm, audioStartAt, riffTotalDuration);

    animateHighway();
  }, [riff, riffTotalDuration, ensureMicrophone, animateHighway]);

  const fullCleanup = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (detectorRef.current) {
      detectorRef.current.stop();
      detectorRef.current = null;
    }
    audioService.stopClickTrack();
    micInitializedRef.current = false;
    phaseRef.current = 'select';
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const resize = () => {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
        }
      };
      resize();
      window.addEventListener('resize', resize);
      return () => {
        window.removeEventListener('resize', resize);
        fullCleanup();
      };
    }
  }, [fullCleanup]);

  const handleExit = useCallback(() => {
    fullCleanup();
    onExit();
  }, [fullCleanup, onExit]);

  const toggleGuideTone = useCallback(() => {
    setGuideToneOn((prev) => {
      const next = !prev;
      guideToneRef.current = next;
      return next;
    });
  }, []);

  const levelPercent = Math.min(100, Math.round(inputLevel * 500));

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col">
      {/* Exit button */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={handleExit}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text transition-colors bg-bg-secondary/80 backdrop-blur rounded-lg px-3 py-2 border border-border"
        >
          <ArrowLeft size={16} /> Exit Riff
        </button>
      </div>

      {/* Guide tone toggle during play */}
      {phase === 'playing' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <button
            onClick={toggleGuideTone}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-2 border transition-all ${
              guideToneOn
                ? 'bg-accent/20 text-accent border-accent/30'
                : 'bg-bg-secondary/80 text-text-muted border-border hover:text-text'
            }`}
          >
            <Headphones size={14} /> Guide {guideToneOn ? 'ON' : 'OFF'}
          </button>
        </div>
      )}

      {/* Score HUD */}
      {phase === 'playing' && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-4 bg-bg-secondary/80 backdrop-blur rounded-xl px-4 py-2.5 border border-border">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-text-muted">Score</p>
            <p className="text-xl font-bold font-display tabular-nums">{score.toLocaleString()}</p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-text-muted">Streak</p>
            <p className="text-xl font-bold font-display text-accent tabular-nums">{streak}</p>
          </div>
          {multiplier > 1 && (
            <div className="px-2 py-1 rounded-lg bg-accent/20 text-accent font-bold text-sm">
              {multiplier}x
            </div>
          )}
        </div>
      )}

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

        {/* Select screen — listen + start */}
        {phase === 'select' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
            <div className="text-center max-w-sm space-y-5">
              <div>
                <h2 className="text-2xl font-bold font-display mb-2">{riff.name}</h2>
                <p className="text-text-secondary text-sm">{riff.description}</p>
              </div>

              {/* Guide tone toggle */}
              <button
                onClick={toggleGuideTone}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-2 border transition-all ${
                  guideToneOn
                    ? 'bg-accent/20 text-accent border-accent/30'
                    : 'bg-bg-secondary text-text-muted border-border hover:text-text'
                }`}
              >
                <Headphones size={14} /> Guide Tone {guideToneOn ? 'ON' : 'OFF'}
              </button>

              {/* Listen to Riff */}
              <Button
                fullWidth
                size="lg"
                variant="secondary"
                onClick={listenToRiff}
                leftIcon={<Music size={18} />}
                loading={isListeningPreview}
              >
                {isListeningPreview ? 'Playing...' : 'Listen to Riff'}
              </Button>

              {/* Start — requests mic + begins game in one action */}
              <Button
                fullWidth
                size="xl"
                onClick={startRiff}
                leftIcon={<Mic size={20} />}
                loading={isStarting}
              >
                {isStarting ? 'Starting...' : 'Start Singing'}
              </Button>

              {micError && (
                <p className="text-sm text-accent text-center">{micError}</p>
              )}

              <p className="text-xs text-text-muted text-center">
                Press Start, allow microphone, then sing each note as it hits the strike zone.
              </p>
            </div>
          </div>
        )}

        {/* Debug info during play */}
        {phase === 'playing' && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-bg-secondary/80 backdrop-blur rounded-xl px-4 py-2 border border-border flex items-center gap-4 text-xs font-mono">
            <span className={detectedNote ? 'text-success' : 'text-text-muted'}>
              {detectedNote ? `Note: ${detectedNote}` : 'Listening...'}
            </span>
            <span className="text-text-muted">Lvl: {levelPercent}%</span>
            <div className="w-16 h-1.5 rounded-full bg-bg overflow-hidden">
              <div className="h-full bg-accent" style={{ width: `${levelPercent}%` }} />
            </div>
          </div>
        )}

        {/* Result overlay */}
        {phase === 'finished' && result && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-bg/90 backdrop-blur-sm px-6">
            <div className="text-center max-w-sm w-full animate-scale-in">
              <h2 className="text-3xl font-bold font-display mb-1">RIFF COMPLETE</h2>
              <p className="text-text-muted text-sm mb-6">{riff.name}</p>

              <div className="flex items-center justify-center gap-2 mb-6">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`text-4xl transition-all ${i < result.stars ? 'opacity-100 scale-100' : 'opacity-20 scale-90'}`}
                    style={{
                      animationDelay: `${i * 0.15}s`,
                      animation: i < result.stars ? 'reward-pop 0.5s ease-out both' : 'none',
                    }}
                  >
                    <svg width="48" height="48" viewBox="0 0 24 24" fill={i < result.stars ? '#F5C542' : '#6B6B72'}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="rounded-xl bg-bg-secondary border border-border p-4">
                  <p className="text-2xl font-bold font-display tabular-nums">{result.score.toLocaleString()}</p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Score</p>
                </div>
                <div className="rounded-xl bg-bg-secondary border border-border p-4">
                  <p className="text-2xl font-bold font-display tabular-nums">{result.accuracy}%</p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Accuracy</p>
                </div>
                <div className="rounded-xl bg-bg-secondary border border-border p-4">
                  <p className="text-2xl font-bold font-display text-accent tabular-nums">{result.maxStreak}</p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">Max Streak</p>
                </div>
                <div className="rounded-xl bg-bg-secondary border border-border p-4">
                  <p className="text-2xl font-bold font-display text-xp tabular-nums">+{result.xpGained}</p>
                  <p className="text-xs text-text-muted uppercase tracking-wider">XP Gained</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  fullWidth
                  size="lg"
                  variant="secondary"
                  onClick={() => {
                    setPhase('select');
                    phaseRef.current = 'select';
                  }}
                >
                  Retry
                </Button>
                <Button fullWidth size="lg" onClick={handleExit} leftIcon={<X size={18} />}>
                  Back to Riffs
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
