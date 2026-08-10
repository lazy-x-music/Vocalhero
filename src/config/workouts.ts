export type StageVisualType = 'lip-trill' | 'humming' | 'siren' | 'vowel' | 'sequence';

export interface WorkoutStage {
  id: number;
  title: string;
  description: string;
  exercise: string;
  instructions: string;
  durationSec: number;
  visual: StageVisualType;
  /** For sequence stages: ordered list of sub-steps */
  sequence?: { label: string; durationSec: number; visual: StageVisualType }[];
}

export interface Workout {
  id: string;
  title: string;
  subtitle: string;
  totalDurationMin: number;
  xpReward: number;
  stages: WorkoutStage[];
}

export const VOICE_AWAKENING: Workout = {
  id: 'voice-awakening',
  title: 'Voice Awakening',
  subtitle: 'Your first mission starts now.',
  totalDurationMin: 10,
  xpReward: 50,
  stages: [
    {
      id: 1,
      title: 'Wake Up',
      description: 'Gently wake up your voice and get everything moving.',
      exercise: 'Lip Trills',
      instructions:
        'Make a gentle brrrr sound with your lips. Keep the airflow relaxed. Don\u2019t push.',
      durationSec: 120,
      visual: 'lip-trill',
    },
    {
      id: 2,
      title: 'Pitch Lock',
      description: 'Start finding your voice\u2019s center.',
      exercise: 'Humming',
      instructions:
        'Hum gently on a comfortable note. Focus on a steady, relaxed sound.',
      durationSec: 120,
      visual: 'humming',
    },
    {
      id: 3,
      title: 'Range Quest',
      description: 'Explore your voice without forcing it.',
      exercise: 'Gentle Sirens',
      instructions:
        'Glide smoothly from a comfortable low note toward a comfortable higher note and back down. Never force the top.',
      durationSec: 120,
      visual: 'siren',
    },
    {
      id: 4,
      title: 'Power Builder',
      description: 'Build controlled vocal energy.',
      exercise: 'Controlled Sustained Vowel',
      instructions:
        'Choose a comfortable note and sustain an \u2018AH\u2019 sound with steady airflow. Stay relaxed.',
      durationSec: 120,
      visual: 'vowel',
    },
    {
      id: 5,
      title: 'Hero Challenge',
      description: 'Bring together what you just trained.',
      exercise: 'Full Sequence',
      instructions:
        'Run through a short sequence: gentle hum \u2192 comfortable note \u2192 gentle glide \u2192 controlled sustained vowel.',
      durationSec: 120,
      visual: 'sequence',
      sequence: [
        { label: 'Gentle Hum', durationSec: 30, visual: 'humming' },
        { label: 'Comfortable Note', durationSec: 30, visual: 'vowel' },
        { label: 'Gentle Glide', durationSec: 30, visual: 'siren' },
        { label: 'Sustained Vowel', durationSec: 30, visual: 'vowel' },
      ],
    },
  ],
};

export const WORKOUTS: Record<string, Workout> = {
  [VOICE_AWAKENING.id]: VOICE_AWAKENING,
};

export function getWorkout(id: string): Workout | undefined {
  return WORKOUTS[id];
}
