import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sunrise, Target, Flame, Zap, Wind, Moon, Waves, Layers, Guitar,
  Sparkles, Activity, Ear, Expand, Clock, ChevronRight, Dumbbell,
  Plus, X, Trash2, GripVertical, Save, Pencil, Search,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import {
  TRAINING_PROGRAMS, EXERCISE_LIBRARY,
  getCustomPrograms, saveCustomProgram, deleteCustomProgram,
  type TrainingProgram, type TrainingStage, type ExerciseLibraryItem,
} from '@/config/training';
import { useAuth } from '@/context/AuthContext';

const ICONS: Record<string, typeof Sunrise> = {
  sunrise: Sunrise,
  target: Target,
  flame: Flame,
  zap: Zap,
  wind: Wind,
  moon: Moon,
  waves: Waves,
  layers: Layers,
  guitar: Guitar,
  sparkles: Sparkles,
  activity: Activity,
  ear: Ear,
  expand: Expand,
  custom: Pencil,
};

const CATEGORY_COLORS: Record<string, string> = {
  'Warm-up': 'text-amber-400 bg-amber-400/10',
  'Technique': 'text-blue-400 bg-blue-400/10',
  'Workout': 'text-accent bg-accent/10',
  'Cool-down': 'text-indigo-300 bg-indigo-300/10',
};

const DIFFICULTY_BADGE: Record<string, string> = {
  Beginner: 'text-success bg-success/10',
  Intermediate: 'text-xp bg-xp/10',
  Advanced: 'text-accent bg-accent/10',
};

const PROGRAM_ICONS = ['flame', 'target', 'zap', 'wind', 'moon', 'waves', 'layers', 'guitar', 'sparkles', 'activity', 'ear', 'expand'];

// ─── Custom Program Builder Modal ────────────────────────────────

interface BuilderState {
  id: string;
  title: string;
  description: string;
  category: TrainingProgram['category'];
  difficulty: TrainingProgram['difficulty'];
  icon: string;
  stages: TrainingStage[];
}

function emptyBuilderState(): BuilderState {
  return {
    id: `custom-${Date.now()}`,
    title: '',
    description: '',
    category: 'Technique',
    difficulty: 'Intermediate',
    icon: 'flame',
    stages: [],
  };
}

function CustomProgramBuilder({
  initial,
  onSave,
  onCancel,
}: {
  initial: BuilderState;
  onSave: (program: TrainingProgram) => void;
  onCancel: () => void;
}) {
  const [state, setState] = useState<BuilderState>(initial);
  const [searchQuery, setSearchQuery] = useState('');
  const [exerciseFilter, setExerciseFilter] = useState<string | null>(null);

  const totalSec = state.stages.reduce((sum, s) => sum + s.durationSec, 0);
  const totalMin = Math.max(1, Math.round(totalSec / 60));
  const xpReward = Math.max(20, Math.round(totalSec / 10));

  const filteredExercises = useMemo(() => {
    return EXERCISE_LIBRARY.filter((ex) => {
      if (exerciseFilter && ex.category !== exerciseFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return ex.name.toLowerCase().includes(q) || ex.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [searchQuery, exerciseFilter]);

  const addExercise = (ex: ExerciseLibraryItem) => {
    setState((prev) => ({
      ...prev,
      stages: [...prev.stages, { name: ex.name, description: ex.description, durationSec: ex.defaultSec }],
    }));
  };

  const removeStage = (idx: number) => {
    setState((prev) => ({ ...prev, stages: prev.stages.filter((_, i) => i !== idx) }));
  };

  const moveStage = (idx: number, dir: -1 | 1) => {
    setState((prev) => {
      const stages = [...prev.stages];
      const target = idx + dir;
      if (target < 0 || target >= stages.length) return prev;
      [stages[idx], stages[target]] = [stages[target], stages[idx]];
      return { ...prev, stages };
    });
  };

  const updateStageDuration = (idx: number, sec: number) => {
    setState((prev) => ({
      ...prev,
      stages: prev.stages.map((s, i) => (i === idx ? { ...s, durationSec: Math.max(15, Math.min(600, sec)) } : s)),
    }));
  };

  const handleSave = () => {
    if (!state.title.trim() || state.stages.length === 0) return;
    onSave({
      ...state,
      title: state.title.trim(),
      description: state.description.trim() || 'Custom training program.',
      durationMin: totalMin,
      xpReward,
      icon: state.icon,
      custom: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={onCancel}>
      <div
        className="bg-bg-secondary border border-border-strong rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-bold font-display">Build Custom Program</h2>
          <button onClick={onCancel} className="text-text-muted hover:text-text transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Program meta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-1.5 block">Program Name</label>
              <input
                type="text"
                value={state.title}
                onChange={(e) => setState((p) => ({ ...p, title: e.target.value }))}
                placeholder="My Vocal Routine"
                className="w-full px-3 py-2.5 rounded-xl bg-bg-tertiary border border-border text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-1.5 block">Description</label>
              <input
                type="text"
                value={state.description}
                onChange={(e) => setState((p) => ({ ...p, description: e.target.value }))}
                placeholder="What does this program focus on?"
                className="w-full px-3 py-2.5 rounded-xl bg-bg-tertiary border border-border text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-1.5 block">Category</label>
              <select
                value={state.category}
                onChange={(e) => setState((p) => ({ ...p, category: e.target.value as TrainingProgram['category'] }))}
                className="w-full px-3 py-2.5 rounded-xl bg-bg-tertiary border border-border text-sm text-text focus:outline-none focus:border-accent/50 transition-colors"
              >
                <option value="Warm-up">Warm-up</option>
                <option value="Technique">Technique</option>
                <option value="Workout">Workout</option>
                <option value="Cool-down">Cool-down</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-1.5 block">Difficulty</label>
              <select
                value={state.difficulty}
                onChange={(e) => setState((p) => ({ ...p, difficulty: e.target.value as TrainingProgram['difficulty'] }))}
                className="w-full px-3 py-2.5 rounded-xl bg-bg-tertiary border border-border text-sm text-text focus:outline-none focus:border-accent/50 transition-colors"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-text-muted font-semibold mb-1.5 block">Icon</label>
              <div className="flex flex-wrap gap-1.5">
                {PROGRAM_ICONS.map((ic) => {
                  const Ic = ICONS[ic] ?? Flame;
                  return (
                    <button
                      key={ic}
                      onClick={() => setState((p) => ({ ...p, icon: ic }))}
                      className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                        state.icon === ic ? 'bg-accent/20 text-accent border border-accent/30' : 'bg-bg-tertiary text-text-muted hover:text-text border border-border'
                      }`}
                    >
                      <Ic size={16} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Current stages */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase tracking-widest text-text-muted font-semibold">
                Program Stages ({state.stages.length})
              </label>
              <span className="text-xs text-text-muted">
                {totalMin} min total · +{xpReward} XP
              </span>
            </div>
            {state.stages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-6 text-center">
                <p className="text-sm text-text-muted">Add exercises from the library below to build your program.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {state.stages.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-xl bg-bg-tertiary border border-border p-3 animate-fade-up">
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        onClick={() => moveStage(idx, -1)}
                        disabled={idx === 0}
                        className="text-text-muted hover:text-text disabled:opacity-30 transition-colors"
                      >
                        <ChevronRight size={12} className="rotate-[-90deg]" />
                      </button>
                      <GripVertical size={12} className="text-text-muted" />
                      <button
                        onClick={() => moveStage(idx, 1)}
                        disabled={idx === state.stages.length - 1}
                        className="text-text-muted hover:text-text disabled:opacity-30 transition-colors"
                      >
                        <ChevronRight size={12} className="rotate-90" />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{stage.name}</p>
                      <p className="text-xs text-text-secondary truncate">{stage.description}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        value={Math.round(stage.durationSec / 15) * 15}
                        onChange={(e) => updateStageDuration(idx, parseInt(e.target.value) || 15)}
                        min={15}
                        max={600}
                        step={15}
                        className="w-16 px-2 py-1 rounded-lg bg-bg border border-border text-xs text-text text-center focus:outline-none focus:border-accent/50"
                      />
                      <span className="text-xs text-text-muted">s</span>
                    </div>
                    <button
                      onClick={() => removeStage(idx)}
                      className="text-text-muted hover:text-accent transition-colors shrink-0 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Exercise library */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase tracking-widest text-text-muted font-semibold">Exercise Library</label>
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercises..."
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-bg-tertiary border border-border text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-accent/50 w-44"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button
                onClick={() => setExerciseFilter(null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  exerciseFilter === null ? 'bg-white/10 text-text border border-border-strong' : 'text-text-muted hover:text-text'
                }`}
              >
                All
              </button>
              {['Warm-up', 'Technique', 'Workout', 'Cool-down'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setExerciseFilter(exerciseFilter === cat ? null : cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    exerciseFilter === cat ? 'bg-white/10 text-text border border-border-strong' : 'text-text-muted hover:text-text'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
              {filteredExercises.map((ex) => {
                const catColor = CATEGORY_COLORS[ex.category] ?? 'text-text-muted bg-white/5';
                const diffBadge = DIFFICULTY_BADGE[ex.difficulty] ?? '';
                return (
                  <button
                    key={ex.id}
                    onClick={() => addExercise(ex)}
                    className="group flex items-start gap-3 rounded-xl bg-bg-tertiary border border-border p-3 hover:border-accent/30 transition-all text-left"
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${catColor}`}>
                      <Plus size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{ex.name}</p>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-1">{ex.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-text-muted">{ex.defaultSec}s</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${diffBadge}`}>{ex.difficulty}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
          <div className="text-sm text-text-muted">
            {state.stages.length} stages · {totalMin} min · +{xpReward} XP
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!state.title.trim() || state.stages.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save size={16} /> Save Program
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Train Page ─────────────────────────────────────────────

export function TrainPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string | null>(null);
  const [customPrograms, setCustomPrograms] = useState<TrainingProgram[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingProgram, setEditingProgram] = useState<BuilderState | null>(null);
  const [customFilter, setCustomFilter] = useState(false);

  const refreshCustom = useCallback(() => {
    setCustomPrograms(getCustomPrograms());
  }, []);

  // Load custom programs on mount
  useMemo(() => {
    refreshCustom();
  }, [refreshCustom]);

  const categories = ['Warm-up', 'Technique', 'Workout', 'Cool-down'];
  const allPrograms = customFilter ? customPrograms : [...TRAINING_PROGRAMS, ...customPrograms];
  const programs = filter ? allPrograms.filter((p) => p.category === filter) : allPrograms;

  const handleStart = (program: TrainingProgram) => {
    navigate('/workout', { state: { programId: program.id } });
  };

  const handleSaveProgram = (program: TrainingProgram) => {
    saveCustomProgram(program);
    refreshCustom();
    setShowBuilder(false);
    setEditingProgram(null);
  };

  const handleEditProgram = (program: TrainingProgram) => {
    setEditingProgram({
      id: program.id,
      title: program.title,
      description: program.description,
      category: program.category,
      difficulty: program.difficulty,
      icon: program.icon,
      stages: program.stages,
    });
    setShowBuilder(true);
  };

  const handleDeleteProgram = (id: string) => {
    deleteCustomProgram(id);
    refreshCustom();
  };

  const builderInitial = editingProgram ?? emptyBuilderState();

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
              <Dumbbell size={24} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold font-display">Training Programs</h1>
              <p className="text-text-secondary text-sm">Choose a program or build your own.</p>
            </div>
            <button
              onClick={() => { setEditingProgram(null); setShowBuilder(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors shrink-0"
            >
              <Plus size={18} /> Create
            </button>
          </div>
        </div>

        {/* Daily recommendation */}
        <div className="rounded-2xl bg-gradient-to-br from-accent/10 to-bg-secondary border border-accent/20 p-6 animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-accent/20 flex items-center justify-center text-accent shrink-0">
              <Sunrise size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">Recommended Today</p>
              <h2 className="text-lg font-bold font-display truncate">Morning Warm-Up</h2>
              <p className="text-sm text-text-secondary truncate">Start your day with gentle vocal exercises.</p>
            </div>
            <button
              onClick={() => handleStart(TRAINING_PROGRAMS[0])}
              className="shrink-0 px-4 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm hover:bg-accent-hover transition-colors"
            >
              Start
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <button
            onClick={() => { setFilter(null); setCustomFilter(false); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === null && !customFilter ? 'bg-white/10 text-text border border-border-strong' : 'text-text-muted hover:text-text'
            }`}
          >
            All Programs
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setFilter(filter === cat ? null : cat); setCustomFilter(false); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === cat && !customFilter ? 'bg-white/10 text-text border border-border-strong' : 'text-text-muted hover:text-text'
              }`}
            >
              {cat}
            </button>
          ))}
          <div className="h-5 w-px bg-border mx-1" />
          <button
            onClick={() => { setCustomFilter(!customFilter); setFilter(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              customFilter ? 'bg-white/10 text-text border border-border-strong' : 'text-text-muted hover:text-text'
            }`}
          >
            My Programs ({customPrograms.length})
          </button>
        </div>

        {/* Program cards */}
        {programs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center animate-fade-up">
            <p className="text-text-muted text-sm">
              {customFilter
                ? 'You haven\'t created any custom programs yet. Click "Create" to build one.'
                : 'No programs match this filter.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
            {programs.map((program) => {
              const Icon = ICONS[program.icon] ?? Dumbbell;
              const catColor = CATEGORY_COLORS[program.category] ?? 'text-text-muted bg-white/5';
              const diffBadge = DIFFICULTY_BADGE[program.difficulty] ?? 'text-text-muted bg-white/5';
              const isCustom = program.custom === true;
              return (
                <div
                  key={program.id}
                  className="group rounded-2xl bg-bg-secondary border border-border p-5 hover:border-border-strong transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${catColor} ${isCustom ? 'ring-1 ring-accent/20' : ''}`}
                    >
                      <Icon size={24} />
                    </div>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleStart(program)}>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold font-display text-base truncate">{program.title}</h3>
                        {isCustom && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-semibold shrink-0">
                            CUSTOM
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary line-clamp-2">{program.description}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="flex items-center gap-1 text-xs text-text-muted">
                          <Clock size={12} /> {program.durationMin} min
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${diffBadge}`}>
                          {program.difficulty}
                        </span>
                        <span className="text-xs text-xp font-semibold">+{program.xpReward} XP</span>
                        <span className="text-xs text-text-muted">{program.stages.length} stages</span>
                      </div>
                    </div>
                    {isCustom ? (
                      <div className="flex flex-col gap-1.5 shrink-0">
                        <button
                          onClick={() => handleStart(program)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-accent transition-colors"
                          title="Start"
                        >
                          <ChevronRight size={18} />
                        </button>
                        <button
                          onClick={() => handleEditProgram(program)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-text transition-colors"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteProgram(program.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-accent transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <ChevronRight
                        size={20}
                        className="text-text-muted shrink-0 group-hover:text-text transition-colors cursor-pointer"
                        onClick={() => handleStart(program)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats footer */}
        {profile && (
          <div className="rounded-2xl bg-bg-secondary border border-border p-5 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold font-display text-accent">{profile.totalWorkouts}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Workouts Done</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-xp">{profile.totalWorkoutMinutes}m</p>
                <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Time Trained</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-display text-success">{profile.longestStreak}</p>
                <p className="text-xs text-text-muted uppercase tracking-wider mt-1">Best Streak</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Program Builder Modal */}
      {showBuilder && (
        <CustomProgramBuilder
          initial={builderInitial}
          onSave={handleSaveProgram}
          onCancel={() => { setShowBuilder(false); setEditingProgram(null); }}
        />
      )}
    </AppShell>
  );
}
