export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  category: 'Workouts' | 'Riffs' | 'Streaks' | 'Levels' | 'Special';
  condition: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  totalWorkouts: number;
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalWorkoutMinutes: number;
  riffScores: { riffId: string; stars: number; accuracy: number }[];
  perfectRiffs: number;
  bestRiffAccuracy: number;
  totalRiffsCompleted: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Workouts
  {
    id: 'first-workout',
    name: 'First Steps',
    description: 'Complete your first workout.',
    icon: 'footprints',
    xpReward: 20,
    category: 'Workouts',
    condition: (s) => s.totalWorkouts >= 1,
  },
  {
    id: 'workout-5',
    name: 'Getting Serious',
    description: 'Complete 5 workouts.',
    icon: 'dumbbell',
    xpReward: 50,
    category: 'Workouts',
    condition: (s) => s.totalWorkouts >= 5,
  },
  {
    id: 'workout-25',
    name: 'Dedicated Singer',
    description: 'Complete 25 workouts.',
    icon: 'medal',
    xpReward: 150,
    category: 'Workouts',
    condition: (s) => s.totalWorkouts >= 25,
  },
  {
    id: 'workout-100',
    name: 'Centurion',
    description: 'Complete 100 workouts.',
    icon: 'crown',
    xpReward: 500,
    category: 'Workouts',
    condition: (s) => s.totalWorkouts >= 100,
  },
  // Streaks
  {
    id: 'streak-3',
    name: 'On a Roll',
    description: 'Maintain a 3-day streak.',
    icon: 'flame',
    xpReward: 30,
    category: 'Streaks',
    condition: (s) => s.longestStreak >= 3,
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak.',
    icon: 'calendar-check',
    xpReward: 70,
    category: 'Streaks',
    condition: (s) => s.longestStreak >= 7,
  },
  {
    id: 'streak-30',
    name: 'Unbreakable',
    description: 'Maintain a 30-day streak.',
    icon: 'shield',
    xpReward: 300,
    category: 'Streaks',
    condition: (s) => s.longestStreak >= 30,
  },
  // Levels
  {
    id: 'level-3',
    name: 'Stage Warrior',
    description: 'Reach Level 3.',
    icon: 'star',
    xpReward: 50,
    category: 'Levels',
    condition: (s) => s.level >= 3,
  },
  {
    id: 'level-5',
    name: 'Arena Hero',
    description: 'Reach Level 5.',
    icon: 'trophy',
    xpReward: 200,
    category: 'Levels',
    condition: (s) => s.level >= 5,
  },
  {
    id: 'level-6',
    name: 'Vocal Legend',
    description: 'Reach the maximum level.',
    icon: 'award',
    xpReward: 500,
    category: 'Levels',
    condition: (s) => s.level >= 6,
  },
  // Riffs
  {
    id: 'first-riff',
    name: 'Riff Rookie',
    description: 'Complete your first riff.',
    icon: 'music',
    xpReward: 20,
    category: 'Riffs',
    condition: (s) => s.totalRiffsCompleted >= 1,
  },
  {
    id: 'perfect-riff',
    name: 'Perfect Pitch',
    description: 'Get 3 stars on any riff.',
    icon: 'sparkles',
    xpReward: 100,
    category: 'Riffs',
    condition: (s) => s.perfectRiffs >= 1,
  },
  {
    id: 'all-riffs',
    name: 'Riff Master',
    description: 'Complete all available riffs.',
    icon: 'guitar',
    xpReward: 150,
    category: 'Riffs',
    condition: (s) => s.totalRiffsCompleted >= 3,
  },
  {
    id: 'riffs-10',
    name: 'Riff Addict',
    description: 'Complete 10 riff sessions.',
    icon: 'repeat',
    xpReward: 100,
    category: 'Riffs',
    condition: (s) => s.totalRiffsCompleted >= 10,
  },
  // Special
  {
    id: 'time-invested',
    name: 'Time Keeper',
    description: 'Train for a total of 60 minutes.',
    icon: 'clock',
    xpReward: 50,
    category: 'Special',
    condition: (s) => s.totalWorkoutMinutes >= 60,
  },
  {
    id: 'xp-1000',
    name: 'XP Hunter',
    description: 'Earn 1000 total XP.',
    icon: 'gem',
    xpReward: 100,
    category: 'Special',
    condition: (s) => s.totalXp >= 1000,
  },
];
