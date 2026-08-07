import type { UserProfile, OnboardingData } from '@/types';

export function defaultUserProfile(
  uid: string,
  displayName: string,
  email: string
): UserProfile {
  return {
    uid,
    displayName,
    email,
    createdAt: Date.now(),
    level: 1,
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalWorkoutMinutes: 0,
    totalWorkouts: 0,
    onboardingCompleted: false,
  };
}

export function defaultOnboardingData(): OnboardingData {
  return { singerType: null, goals: [], musicStyles: [], inspirations: [] };
}
