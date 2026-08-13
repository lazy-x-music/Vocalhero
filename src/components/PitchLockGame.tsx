import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Play, RotateCcw, Volume2, Flame, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PitchIndicator } from '@/components/PitchIndicator';
import { PitchDetector } from '@/lib/pitchDetector';
import { audioService } from '@/lib/audioService';
import {
  BEGINNER_NOTES,
  noteStringToFrequency,
  frequencyToNoteString,
  centsDifference,
} from '@/lib/noteUtils';
import { useAuth } from '@/context/AuthContext';
import { addXp } from '@/lib/userService';

interface PitchLockGameProps {
  onComplete: () => void;
}

type GameState = 'idle' | 'requesting-mic' | 'ready' | 'playing' | 'locked' | 'perfect';

const TOLERANCE_CENTS = 50;
const HOLD_TIME_MS = 1000;
const XP_PER_HIT = 10;
const XP_PERFECT_BONUS = 25;
const TOTAL_NOTES = BEGINNER_NOTES.length;

export function PitchLockGame({ onComplete }: PitchLockGameProps) {
  const { user, refreshProfile } = useAuth();

  const [gameState, setGameState] = useState<GameState>('idle');
  const [noteIndex, setNoteIndex] = useState(0);
  const [combo, setCombo] = useState(0);
  const [detectedFreq, setDetectedFreq] = useState(0);
  const [cents, setCents] = useState(0);
  const [hitFeedback, setHitFeedback] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [totalXpEarned, setTotalXpEarned] = useState(0);

  const detectorRef = useRef<PitchDetector | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const lockedRef = useRef(false);
  const noteIndexRef = useRef(0);
  const comboRef = useRef(0);

  const targetNote = BEGINNER_NOTES[noteIndex];
  const targetFreq = noteStringToFrequency(targetNote);

  useEffect(() => {
    noteIndexRef.current = noteIndex;
  }, [noteIndex]);

  useEffect(() => {
    comboRef.current = combo;
  }, [combo]);

  const handlePitch = useCallback(
    (freq: number) => {
      if (lockedRef.current) return;

      setDetectedFreq(freq);

      if (freq <= 0) {
        setCents(0);
        holdStartRef.current = null;
        return;
      }

      const currentTarget = BEGINNER_NOTES[noteIndexRef.current];
      const currentTargetFreq = noteStringToFrequency(currentTarget);
      const diff = centsDifference(currentTargetFreq, freq);
      setCents(diff);

      if (Math.abs(diff) <= TOLERANCE_CENTS) {
        if (holdStartRef.current === null) {
          holdStartRef.current = Date.now();
        } else if (Date.now() - holdStartRef.current >= HOLD_TIME_MS) {
          lockedRef.current = true;
          handleHit();
        }
      } else {
        holdStartRef.current = null;
        if (diff > TOLERANCE_CENTS && diff < 200) {
          setHitFeedback('A little lower');
        } else if (diff < -TOLERANCE_CENTS && diff > -200) {
          setHitFeedback('A little higher');
        } else {
          setHitFeedback(null);
        }
      }
    },
    []
  );

  const handleHit = useCallback(async () => {
    const newCombo = comboRef.current + 1;
    comboRef.current = newCombo;
    setCombo(newCombo);
    setHitFeedback(null);

    void audioService.playSuccessSound();
    setGameState('locked');

    let xpThisHit = XP_PER_HIT;
    let bonusXp = 0;

    if (newCombo >= TOTAL_NOTES) {
      bonusXp = XP_PERFECT_BONUS;
      xpThisHit += bonusXp;
      setGameState('perfect');
      void audioService.playPerfectRunSound();
    }

    setTotalXpEarned((prev) => prev + xpThisHit);

    if (user) {
      const result = await addXp(user.uid, xpThisHit);
      if (result !== null) await refreshProfile();
    }

    setTimeout(() => {
      if (newCombo >= TOTAL_NOTES) {
        lockedRef.current = true;
        setGameState('ready');
        return;
      }
      const nextIndex = noteIndexRef.current + 1;
      noteIndexRef.current = nextIndex;
      setNoteIndex(nextIndex);
      holdStartRef.current = null;
      lockedRef.current = false;
      setGameState('playing');
      void audioService.playReferenceTone(BEGINNER_NOTES[nextIndex]);
    }, 1400);
  }, [user, refreshProfile]);

  const enableMicrophone = useCallback(async () => {
    setGameState('requesting-mic');
    setMicError(null);
    try {
      const ctx = await audioService.ensureContext();
      console.log('[PitchLock] AudioContext state after ensureContext:', ctx.state);

      const detector = new PitchDetector();
      await detector.start(handlePitch);
      detectorRef.current = detector;
      console.log('[PitchLock] PitchDetector started successfully');
      setGameState('ready');
    } catch (err) {
      console.error('[PitchLock] Microphone/audio init failed:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setMicError(`Microphone access is needed to hear your voice. Please allow microphone access and try again. (${msg})`);
      setGameState('idle');
    }
  }, [handlePitch]);

  const startGame = useCallback(async () => {
    setGameState('playing');
    console.log('[PitchLock] Start button tapped — playing first reference tone');
    await audioService.playReferenceTone(BEGINNER_NOTES[0]);
    console.log('[PitchLock] Reference tone playback initiated');
  }, []);

  const replayNote = useCallback(async () => {
    await audioService.playReferenceTone(BEGINNER_NOTES[noteIndexRef.current]);
  }, []);

  const finishGame = useCallback(() => {
    if (detectorRef.current) {
      detectorRef.current.stop();
      detectorRef.current = null;
    }
    onComplete();
  }, [onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (detectorRef.current) {
        detectorRef.current.stop();
        detectorRef.current = null;
      }
    };
  }, []);

  const detectedNote = detectedFreq > 0 ? frequencyToNoteString(detectedFreq) : null;
  const progress = (noteIndex / TOTAL_NOTES) * 100;

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <span className="text-xs uppercase tracking-widest text-accent font-bold">Stage 2 — Pitch Lock</span>
        <h1 className="text-3xl font-bold font-display mt-1">PITCH LOCK</h1>
        <p className="text-text-secondary mt-1">Match the note.</p>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-text-muted">Notes</span>
          <span className="text-xs font-semibold text-text-secondary">{Math.min(noteIndex, TOTAL_NOTES)} / {TOTAL_NOTES}</span>
        </div>
        <div className="h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-red-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Combo counter */}
      {combo > 0 && gameState !== 'idle' && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <Flame size={18} className="text-accent" />
          <span className="text-lg font-bold font-display text-accent">{combo} HIT{combo > 1 ? 'S' : ''}</span>
          {totalXpEarned > 0 && (
            <span className="text-sm text-xp font-semibold ml-2">+{totalXpEarned} XP</span>
          )}
        </div>
      )}

      {/* Target note */}
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-1">Target Note</p>
          <p className="text-6xl font-extrabold font-display text-accent">{targetNote}</p>
          <p className="text-xs text-text-muted tabular-nums mt-1">{Math.round(targetFreq)} Hz</p>
        </div>
      </div>

      {/* Pitch indicator */}
      <div className="rounded-2xl bg-bg-secondary border border-border p-4 my-2">
        <PitchIndicator
          cents={cents}
          onTarget={Math.abs(cents) <= TOLERANCE_CENTS && detectedFreq > 0}
          targetNote={targetNote}
          detectedNote={detectedNote}
          frequency={detectedFreq > 0 ? detectedFreq : null}
        />
      </div>

      {/* Feedback */}
      {hitFeedback && gameState === 'playing' && (
        <div className="text-center text-sm text-text-secondary font-medium animate-fade-up">
          {hitFeedback}
        </div>
      )}

      {/* Locked feedback */}
      {(gameState === 'locked' || gameState === 'perfect') && (
        <div className="text-center my-3 animate-reward-pop">
          <p className="text-2xl font-bold font-display text-success flex items-center justify-center gap-2">
            <Flame size={24} /> PITCH LOCKED!
          </p>
          <p className="text-sm text-xp font-semibold mt-1">+{XP_PER_HIT} XP</p>
          {gameState === 'perfect' && (
            <p className="text-lg font-bold font-display text-accent mt-2">PERFECT RUN! +{XP_PERFECT_BONUS} XP</p>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="mt-auto pt-4 pb-2 space-y-3">
        {gameState === 'idle' && (
          <>
            <Button fullWidth size="lg" onClick={enableMicrophone} leftIcon={<Mic size={18} />}>
              Enable Microphone
            </Button>
            <p className="text-xs text-text-muted text-center px-4">
              We use your microphone to hear your voice and detect pitch in real time. Audio stays in your browser and is never recorded or uploaded.
            </p>
            {micError && (
              <p className="text-sm text-accent text-center">{micError}</p>
            )}
          </>
        )}

        {gameState === 'requesting-mic' && (
          <p className="text-sm text-text-secondary text-center">Requesting microphone access...</p>
        )}

        {gameState === 'ready' && (
          <>
            {combo >= TOTAL_NOTES ? (
              <Button fullWidth size="xl" onClick={finishGame} rightIcon={<ArrowRight size={20} />}>
                Continue to Stage 3
              </Button>
            ) : (
              <Button fullWidth size="xl" onClick={startGame} leftIcon={<Play size={20} />}>
                Start Pitch Lock
              </Button>
            )}
          </>
        )}

        {gameState === 'playing' && (
          <div className="flex gap-3">
            <Button size="lg" variant="secondary" onClick={replayNote} leftIcon={<Volume2 size={18} />}>
              Replay
            </Button>
            <Button size="lg" variant="ghost" onClick={finishGame} rightIcon={<ArrowRight size={18} />}>
              Continue
            </Button>
          </div>
        )}

        {(gameState === 'locked' || gameState === 'perfect') && (
          <div className="flex gap-3">
            <Button size="lg" variant="secondary" onClick={replayNote} leftIcon={<RotateCcw size={18} />}>
              Replay
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
