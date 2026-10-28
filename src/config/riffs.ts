export interface RiffNote {
  note: string;
  /** Time in seconds from the start of the riff when this note should be sung */
  time: number;
  /** Duration in seconds the note should be held */
  duration: number;
}

export interface Riff {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  bpm: number;
  notes: RiffNote[];
  /** Color theme for the highway */
  color: string;
  xpReward: number;
}

export const RIFFS: Riff[] = [
  {
    id: 'rock-warmup',
    name: 'Rock Warmup',
    description: 'Simple 3-note pentatonic pattern. Great for getting started.',
    difficulty: 'Easy',
    bpm: 90,
    color: '#E53935',
    xpReward: 30,
    notes: [
      // 90 BPM = 0.6667s per beat. All notes on beat boundaries.
      { note: 'E3', time: 2.000, duration: 0.667 },
      { note: 'G3', time: 2.667, duration: 0.667 },
      { note: 'A3', time: 3.333, duration: 0.667 },
      { note: 'G3', time: 4.000, duration: 0.667 },
      { note: 'E3', time: 4.667, duration: 0.667 },
      { note: 'G3', time: 5.333, duration: 0.667 },
      { note: 'A3', time: 6.000, duration: 0.667 },
      { note: 'E3', time: 6.667, duration: 1.333 },
    ],
  },
  {
    id: 'vocal-arpeggio',
    name: 'Vocal Arpeggio',
    description: 'Classic 1-3-5-3-1 octave sweep. Smooth transitions are key.',
    difficulty: 'Medium',
    bpm: 100,
    color: '#3B82F6',
    xpReward: 50,
    notes: [
      // 100 BPM = 0.6s per beat. Two beats per note.
      { note: 'C4', time: 1.200, duration: 1.200 },
      { note: 'E4', time: 2.400, duration: 1.200 },
      { note: 'G4', time: 3.600, duration: 1.200 },
      { note: 'C5', time: 4.800, duration: 1.200 },
      { note: 'G4', time: 6.000, duration: 1.200 },
      { note: 'E4', time: 7.200, duration: 1.200 },
      { note: 'C4', time: 8.400, duration: 1.800 },
    ],
  },
  {
    id: 'metal-riff',
    name: 'Metal Riff',
    description: 'Faster, punchier sequence. Tests pitch accuracy at speed.',
    difficulty: 'Hard',
    bpm: 130,
    color: '#A855F7',
    xpReward: 75,
    notes: [
      // 130 BPM = 0.4615s per beat. One note per beat.
      { note: 'E3', time: 0.923, duration: 0.462 },
      { note: 'G3', time: 1.385, duration: 0.462 },
      { note: 'A3', time: 1.846, duration: 0.462 },
      { note: 'E3', time: 2.308, duration: 0.462 },
      { note: 'A3', time: 2.769, duration: 0.462 },
      { note: 'G3', time: 3.231, duration: 0.462 },
      { note: 'E3', time: 3.692, duration: 0.462 },
      { note: 'D3', time: 4.154, duration: 0.462 },
      { note: 'E3', time: 4.615, duration: 0.462 },
      { note: 'G3', time: 5.077, duration: 0.462 },
      { note: 'A3', time: 5.538, duration: 0.462 },
      { note: 'E3', time: 6.000, duration: 0.923 },
    ],
  },
];
