export type SingerType =
  | 'just_starting'
  | 'for_fun'
  | 'years'
  | 'perform_regularly';

export type VocalGoal =
  | 'pitch'
  | 'power'
  | 'range'
  | 'control'
  | 'endurance'
  | 'tone'
  | 'confidence';

export type MusicStyle =
  | 'rock'
  | 'metal'
  | 'alternative'
  | 'pop'
  | 'punk'
  | 'indie'
  | 'soul'
  | 'country'
  | 'musical_theatre';

export interface OnboardingData {
  singerType: SingerType | null;
  goals: VocalGoal[];
  musicStyles: MusicStyle[];
  inspirations: string[];
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  createdAt: number;
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  totalWorkoutMinutes: number;
  totalWorkouts: number;
  onboardingCompleted: boolean;
  onboarding?: OnboardingData;
}

export interface LevelInfo {
  level: number;
  name: string;
  minXp: number;
  maxXp: number | null;
}
