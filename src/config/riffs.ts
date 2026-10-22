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
      { note: 'E3', time: 2.0, duration: 1.0 },
      { note: 'G3', time: 3.5, duration: 1.0 },
      { note: 'A3', time: 5.0, duration: 1.0 },
      { note: 'G3', time: 6.5, duration: 1.0 },
      { note: 'E3', time: 8.0, duration: 1.0 },
      { note: 'G3', time: 9.5, duration: 1.0 },
      { note: 'A3', time: 11.0, duration: 1.0 },
      { note: 'E3', time: 12.5, duration: 1.5 },
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
      { note: 'C4', time: 2.0, duration: 0.75 },
      { note: 'E4', time: 3.0, duration: 0.75 },
      { note: 'G4', time: 4.0, duration: 0.75 },
      { note: 'C5', time: 5.0, duration: 1.0 },
      { note: 'G4', time: 6.5, duration: 0.75 },
      { note: 'E4', time: 7.5, duration: 0.75 },
      { note: 'C4', time: 8.5, duration: 1.5 },
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
      { note: 'E3', time: 1.5, duration: 0.5 },
      { note: 'G3', time: 2.25, duration: 0.5 },
      { note: 'A3', time: 3.0, duration: 0.5 },
      { note: 'E3', time: 3.75, duration: 0.5 },
      { note: 'A3', time: 4.5, duration: 0.5 },
      { note: 'G3', time: 5.25, duration: 0.5 },
      { note: 'E3', time: 6.0, duration: 0.5 },
      { note: 'D3', time: 6.75, duration: 0.5 },
      { note: 'E3', time: 7.5, duration: 0.5 },
      { note: 'G3', time: 8.25, duration: 0.5 },
      { note: 'A3', time: 9.0, duration: 0.5 },
      { note: 'E3', time: 9.75, duration: 1.0 },
    ],
  },
];
