import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, ArrowRight, ArrowLeft, Check, Trophy, Flame, Clock, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LevelBadge } from '@/components/LevelBadge';
import { XPProgress } from '@/components/XPProgress';
import { StageVisual } from '@/components/StageVisual';
import { PitchLockGame } from '@/components/PitchLockGame';
import { getLevelInfo } from '@/config/levels';
import { VOICE_AWAKENING, type WorkoutStage } from '@/config/workouts';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { completeWorkout, hasCompletedWorkout, type WorkoutReward } from '@/lib/userService';

type Phase = 'intro' | 'stage' | 'complete';

export function WorkoutPage() {
  const { user, profile, refreshProfile } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('intro');
  const [stageIndex, setStageIndex] = useState(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [running, setRunning] = useState(false);
  const [reward, setReward] = useState<WorkoutReward | null>(null);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const workout = VOICE_AWAKENING;
  const stage = workout.stages[stageIndex];

  // Check if already completed (prevents double-award on refresh)
  useEffect(() => {
    if (user) {
      hasCompletedWorkout(user.uid, workout.id).then(setAlreadyCompleted);
    }
  }, [user, workout.id]);

  // Timer effect
  useEffect(() => {
    if (running && phase === 'stage') {
      intervalRef.current = setInterval(() => {
        setElapsedSec((s) => s + 1);
      }, 1000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [running, phase]);

  const handleStartStage = useCallback(() => {
    setElapsedSec(0);
    setRunning(true);
  }, []);

  const handlePause = useCallback(() => {
    setRunning(false);
  }, []);

  const handleResume = useCallback(() => {
    setRunning(true);
  }, []);

  const handleNextStage = useCallback(() => {
    setRunning(false);
    if (stageIndex < workout.stages.length - 1) {
      setStageIndex(stageIndex + 1);
      setElapsedSec(0);
      setRunning(true);
    } else {
      handleFinish();
    }
  }, [stageIndex, workout.stages.length]);

  const handleFinish = useCallback(async () => {
    if (!user || submitting) return;
    setSubmitting(true);
    setRunning(false);
    try {
      const result = await completeWorkout(
        user.uid,
        workout.id,
        workout.xpReward,
        workout.totalDurationMin
      );
      if (result) {
        setReward(result);
        await refreshProfile();
      } else {
        // Already completed — show completion screen with current profile values
        setAlreadyCompleted(true);
        if (profile) {
          setReward({
            xp: profile.xp,
            totalWorkouts: profile.totalWorkouts,
            totalWorkoutMinutes: profile.totalWorkoutMinutes,
            currentStreak: profile.currentStreak,
            longestStreak: profile.longestStreak,
            firstWorkout: false,
          });
        }
      }
      setPhase('complete');
    } catch {
      toast.show('Could not save your workout. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [user, submitting, workout.id, workout.xpReward, workout.totalDurationMin, refreshProfile, profile, toast]);

  // Intro screen
  if (phase === 'intro') {
    return <IntroScreen workout={workout} onStart={() => { setStageIndex(0); setPhase('stage'); handleStartStage(); }} alreadyCompleted={alreadyCompleted} profile={profile} onBack={() => navigate('/dashboard')} />;
  }

  // Completion screen
  if (phase === 'complete') {
    return <CompleteScreen reward={reward} alreadyCompleted={alreadyCompleted} profile={profile} onBack={() => navigate('/dashboard')} />;
  }

  // Stage screen
  const progress = Math.min(elapsedSec / stage.durationSec, 1);
  const isComplete = elapsedSec >= stage.durationSec;

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] bg-accent/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            <ArrowLeft size={14} /> Exit
          </button>
          {profile && (
            <div className="flex items-center gap-2">
              <LevelBadge level={profile.level} size="sm" />
              <span className="text-sm font-semibold text-xp">{profile.xp} XP</span>
            </div>
          )}
        </div>

        {/* Mission progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest text-text-muted font-semibold">Mission Progress</span>
            <span className="text-xs font-semibold text-text-secondary">{stageIndex + 1} / {workout.stages.length}</span>
          </div>
          <div className="flex gap-1.5">
            {workout.stages.map((s, i) => (
              <div
                key={s.id}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i < stageIndex ? 'bg-accent' : i === stageIndex ? 'bg-accent/60' : 'bg-bg-tertiary'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stage content */}
        {stageIndex === 1 ? (
          <div key="pitch-lock" className="flex-1 flex flex-col animate-stage-enter">
            <PitchLockGame onComplete={handleNextStage} />
          </div>
        ) : (
        <div key={stage.id} className="flex-1 flex flex-col animate-stage-enter">
          <div className="mb-4">
            <span className="text-xs uppercase tracking-widest text-accent font-bold">Stage {stage.id} of {workout.stages.length}</span>
            <h1 className="text-3xl font-bold font-display mt-1">{stage.title}</h1>
            <p className="text-text-secondary mt-1">{stage.description}</p>
          </div>

          {/* Visual */}
          <StageVisual type={stage.visual} active={running} />

          {/* Exercise info */}
          <div className="rounded-2xl bg-bg-secondary border border-border p-5 mt-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Zap size={16} />
              </div>
              <span className="font-semibold">{stage.exercise}</span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">{stage.instructions}</p>
          </div>

          {/* Timer + progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-text-secondary">
                <Clock size={16} />
                <span className="text-sm font-medium tabular-nums">{formatTime(elapsedSec)} / {formatTime(stage.durationSec)}</span>
              </div>
              {isComplete && (
                <span className="text-xs font-semibold text-success flex items-center gap-1">
                  <Check size={14} /> Stage complete
                </span>
              )}
            </div>
            <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-red-500 transition-all duration-1000 ease-linear"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-8 pb-8">
            {!running && elapsedSec === 0 && (
              <Button fullWidth size="lg" onClick={handleStartStage} leftIcon={<Play size={18} />}>
                Start
              </Button>
            )}
            {running && (
              <Button fullWidth size="lg" variant="secondary" onClick={handlePause} leftIcon={<Pause size={18} />}>
                Pause
              </Button>
            )}
            {!running && elapsedSec > 0 && !isComplete && (
              <>
                <Button size="lg" variant="secondary" onClick={handleResume} leftIcon={<Play size={18} />}>
                  Resume
                </Button>
                <Button size="lg" variant="ghost" onClick={handleNextStage} rightIcon={<ArrowRight size={18} />}>
                  Skip
                </Button>
              </>
            )}
            {isComplete && (
              <Button fullWidth size="lg" onClick={handleNextStage} rightIcon={stageIndex < workout.stages.length - 1 ? <ArrowRight size={18} /> : <Trophy size={18} />}>
                {stageIndex < workout.stages.length - 1 ? 'Next Stage' : 'Finish Mission'}
              </Button>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

function IntroScreen({
  workout,
  onStart,
  alreadyCompleted,
  profile,
  onBack,
}: {
  workout: typeof VOICE_AWAKENING;
  onStart: () => void;
  alreadyCompleted: boolean;
  profile: { level: number; xp: number } | null;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[700px] bg-accent/8 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>

        <div className="flex-1 flex flex-col justify-center">
          <div className="animate-fade-up">
            <span className="text-xs uppercase tracking-widest text-accent font-bold">Today's Mission</span>
            <h1 className="text-5xl font-extrabold font-display mt-2 tracking-tight">
              {workout.title.toUpperCase()}
            </h1>
            <p className="text-lg text-text-secondary mt-3">{workout.subtitle}</p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mt-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="rounded-2xl bg-bg-secondary border border-border p-4 text-center">
              <Clock size={20} className="text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold font-display">{workout.totalDurationMin}</p>
              <p className="text-xs text-text-muted uppercase tracking-wider">Minutes</p>
            </div>
            <div className="rounded-2xl bg-bg-secondary border border-border p-4 text-center">
              <Star size={20} className="text-xp mx-auto mb-2" />
              <p className="text-2xl font-bold font-display text-xp">+{workout.xpReward}</p>
              <p className="text-xs text-text-muted uppercase tracking-wider">XP Reward</p>
            </div>
            <div className="rounded-2xl bg-bg-secondary border border-border p-4 text-center">
              <Flame size={20} className="text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold font-display">{workout.stages.length}</p>
              <p className="text-xs text-text-muted uppercase tracking-wider">Stages</p>
            </div>
          </div>

          {/* Current level/XP */}
          {profile && (
            <div className="rounded-2xl bg-bg-secondary border border-border p-5 mt-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <div className="flex items-center gap-3 mb-3">
                <LevelBadge level={profile.level} size="sm" />
                <div>
                  <p className="text-sm font-semibold">{getLevelInfo(profile.level).name}</p>
                  <p className="text-xs text-text-muted">Level {profile.level}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm font-bold text-xp">{profile.xp} XP</p>
                </div>
              </div>
              <XPProgress xp={profile.xp} compact />
            </div>
          )}

          {/* Stage preview */}
          <div className="mt-6 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <p className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-3">Mission Stages</p>
            <div className="space-y-2">
              {workout.stages.map((s, i) => (
                <div key={s.id} className="flex items-center gap-3 rounded-xl bg-bg-secondary/50 border border-border p-3">
                  <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center text-xs font-bold text-accent shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.title}</p>
                    <p className="text-xs text-text-muted truncate">{s.exercise}</p>
                  </div>
                  <span className="text-xs text-text-muted shrink-0">{Math.round(s.durationSec / 60)} min</span>
                </div>
              ))}
            </div>
          </div>

          {alreadyCompleted && (
            <div className="mt-4 rounded-xl bg-success/10 border border-success/20 p-3 text-center text-sm text-success animate-fade-up" style={{ animationDelay: '0.25s' }}>
              You've already completed this mission today. You can replay it, but XP is only awarded once.
            </div>
          )}

          <div className="mt-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button fullWidth size="xl" onClick={onStart} leftIcon={<Play size={20} />}>
              Begin Mission
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompleteScreen({
  reward,
  alreadyCompleted,
  profile,
  onBack,
}: {
  reward: WorkoutReward | null;
  alreadyCompleted: boolean;
  profile: { level: number; xp: number; displayName: string; totalWorkouts: number } | null;
  onBack: () => void;
}) {
  const rewards = [
    { icon: <Star size={20} />, label: 'XP', value: `+${alreadyCompleted ? 0 : 50}`, color: 'text-xp' },
    { icon: <Check size={20} />, label: 'Workout', value: `+${alreadyCompleted ? 0 : 1}`, color: 'text-success' },
    { icon: <Clock size={20} />, label: 'Minutes', value: `+${alreadyCompleted ? 0 : 10}`, color: 'text-text-secondary' },
    { icon: <Flame size={20} />, label: 'Streak', value: `+${alreadyCompleted ? 0 : 1}`, color: 'text-accent' },
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] bg-accent/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Confetti */}
      {!alreadyCompleted && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${(i / 24) * 100}%`,
                top: '-20px',
                animationDelay: `${(i % 8) * 0.15}s`,
                animationDuration: `${1.2 + (i % 5) * 0.2}s`,
              }}
            >
              <div
                className="h-2 w-2 rounded-sm"
                style={{
                  backgroundColor: ['#e53935', '#ffb300', '#43a047', '#1e88e5'][i % 4],
                }}
              />
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-6 py-8">
        <div className="flex-1 flex flex-col justify-center items-center text-center">
          {/* Trophy */}
          <div className="animate-reward-pop mb-6">
            <div className="relative h-24 w-24 rounded-2xl bg-gradient-to-br from-accent to-red-700 flex items-center justify-center shadow-2xl shadow-accent/30">
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20" />
              <Trophy size={48} className="text-white" />
            </div>
          </div>

          <div className="animate-fade-up">
            <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight">
              MISSION COMPLETE
            </h1>
            <p className="text-lg text-text-secondary mt-3 max-w-sm mx-auto">
              {alreadyCompleted
                ? 'You replayed the mission. Keep showing up!'
                : 'You showed up. That\u2019s how voices get stronger.'}
            </p>
          </div>

          {/* First workout celebration */}
          {reward?.firstWorkout && !alreadyCompleted && (
            <div className="mt-6 rounded-2xl bg-gradient-to-r from-accent/10 to-amber-500/10 border border-accent/20 px-6 py-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
              <p className="text-base font-semibold text-accent">
                Your Vocal Hero journey has officially begun.
              </p>
            </div>
          )}

          {/* Rewards grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 w-full max-w-md animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {rewards.map((r, i) => (
              <div
                key={i}
                className="rounded-2xl bg-bg-secondary border border-border p-4 text-center animate-reward-pop"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <div className={`${r.color} mx-auto mb-2 flex justify-center`}>{r.icon}</div>
                <p className="text-xl font-bold font-display">{r.value}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider mt-0.5">{r.label}</p>
              </div>
            ))}
          </div>

          {/* Updated XP/Level */}
          {profile && (
            <div className="w-full max-w-md mt-6 rounded-2xl bg-bg-secondary border border-border p-5 animate-fade-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-3 mb-3">
                <LevelBadge level={profile.level} size="sm" />
                <div>
                  <p className="text-sm font-semibold">{getLevelInfo(profile.level).name}</p>
                  <p className="text-xs text-text-muted">Level {profile.level}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm font-bold text-xp">{profile.xp} XP</p>
                </div>
              </div>
              <XPProgress xp={profile.xp} compact />
            </div>
          )}

          <div className="mt-8 w-full max-w-md animate-fade-up" style={{ animationDelay: '0.6s' }}>
            <Button fullWidth size="xl" onClick={onBack} rightIcon={<ArrowRight size={20} />}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
