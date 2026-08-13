import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { localAuth } from './localAuth';
import { defaultUserProfile, defaultOnboardingData } from './userDefaults';
import type { UserProfile, OnboardingData } from '@/types';

const LOCAL_PROFILES_KEY = 'vocal_hero_local_profiles';
const LOCAL_COMPLETIONS_KEY = 'vocal_hero_workout_completions';

export interface WorkoutCompletion {
  workoutId: string;
  completedAt: number;
  xpAwarded: number;
}

function readLocalCompletions(uid: string): WorkoutCompletion[] {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_COMPLETIONS_KEY) || '{}');
    return all[uid] ?? [];
  } catch {
    return [];
  }
}

function writeLocalCompletions(uid: string, completions: WorkoutCompletion[]) {
  const all = (() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_COMPLETIONS_KEY) || '{}');
    } catch {
      return {};
    }
  })();
  all[uid] = completions;
  localStorage.setItem(LOCAL_COMPLETIONS_KEY, JSON.stringify(all));
}

export async function hasCompletedWorkout(uid: string, workoutId: string): Promise<boolean> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'workout_completions', `${uid}_${workoutId}`));
      return snap.exists();
    } catch {
      // fall through to local
    }
  }
  return readLocalCompletions(uid).some((c) => c.workoutId === workoutId);
}

export interface WorkoutReward {
  xp: number;
  totalWorkouts: number;
  totalWorkoutMinutes: number;
  currentStreak: number;
  longestStreak: number;
  firstWorkout: boolean;
}

export async function completeWorkout(
  uid: string,
  workoutId: string,
  xpReward: number,
  durationMinutes: number
): Promise<WorkoutReward | null> {
  if (await hasCompletedWorkout(uid, workoutId)) {
    return null;
  }

  const profile = await getUserProfile(uid);
  if (!profile) return null;

  const newXp = profile.xp + xpReward;
  const newTotalWorkouts = profile.totalWorkouts + 1;
  const newTotalMinutes = profile.totalWorkoutMinutes + durationMinutes;
  const newStreak = profile.currentStreak + 1;
  const newLongest = Math.max(profile.longestStreak, newStreak);
  const firstWorkout = profile.totalWorkouts === 0;

  await updateUserProfile(uid, {
    xp: newXp,
    totalWorkouts: newTotalWorkouts,
    totalWorkoutMinutes: newTotalMinutes,
    currentStreak: newStreak,
    longestStreak: newLongest,
  });

  const completion: WorkoutCompletion = {
    workoutId,
    completedAt: Date.now(),
    xpAwarded: xpReward,
  };

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'workout_completions', `${uid}_${workoutId}`), {
        uid,
        workoutId,
        completedAt: serverTimestamp(),
        xpAwarded: xpReward,
        durationMinutes,
      });
    } catch {
      // fall through to local
    }
  }

  const completions = readLocalCompletions(uid);
  completions.push(completion);
  writeLocalCompletions(uid, completions);

  return {
    xp: newXp,
    totalWorkouts: newTotalWorkouts,
    totalWorkoutMinutes: newTotalMinutes,
    currentStreak: newStreak,
    longestStreak: newLongest,
    firstWorkout,
  };
}

function readLocalProfiles(): Record<string, UserProfile> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_PROFILES_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeLocalProfiles(p: Record<string, UserProfile>) {
  localStorage.setItem(LOCAL_PROFILES_KEY, JSON.stringify(p));
}

export async function createUserDocument(
  uid: string,
  displayName: string,
  email: string
): Promise<void> {
  const profile = defaultUserProfile(uid, displayName, email);

  if (isFirebaseConfigured && db) {
    await setDoc(
      doc(db, 'users', uid),
      {
        displayName,
        email,
        createdAt: serverTimestamp(),
        level: 1,
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalWorkoutMinutes: 0,
        totalWorkouts: 0,
        onboardingCompleted: false,
      },
      { merge: true }
    );
  }

  // Always keep a local copy too (works in local mode and as offline cache)
  const profiles = readLocalProfiles();
  profiles[uid] = profile;
  writeLocalProfiles(profiles);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isFirebaseConfigured && db) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        const data = snap.data();
        return {
          uid,
          displayName: data.displayName ?? '',
          email: data.email ?? '',
          createdAt: data.createdAt?.toMillis?.() ?? Date.now(),
          level: data.level ?? 1,
          xp: data.xp ?? 0,
          currentStreak: data.currentStreak ?? 0,
          longestStreak: data.longestStreak ?? 0,
          totalWorkoutMinutes: data.totalWorkoutMinutes ?? 0,
          totalWorkouts: data.totalWorkouts ?? 0,
          onboardingCompleted: data.onboardingCompleted ?? false,
          onboarding: data.onboarding ?? defaultOnboardingData(),
        };
      }
    } catch {
      // fall through to local
    }
  }

  const profiles = readLocalProfiles();
  return profiles[uid] ?? null;
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  if (isFirebaseConfigured && db) {
    const { uid: _uid, createdAt: _c, ...writable } = updates;
    void _uid; void _c;
    await updateDoc(doc(db, 'users', uid), writable as Record<string, unknown>);
  }

  const profiles = readLocalProfiles();
  if (profiles[uid]) {
    profiles[uid] = { ...profiles[uid], ...updates };
    writeLocalProfiles(profiles);
  }
}

export async function saveOnboardingData(
  uid: string,
  onboarding: OnboardingData
): Promise<void> {
  await updateUserProfile(uid, { onboarding, onboardingCompleted: true });
}

export async function updateDisplayName(uid: string, displayName: string): Promise<void> {
  await updateUserProfile(uid, { displayName });
  if (localAuth.current()?.uid === uid) {
    // local auth display name handled separately
  }
}

export async function addXp(uid: string, amount: number): Promise<number | null> {
  const profile = await getUserProfile(uid);
  if (!profile) return null;
  const newXp = profile.xp + amount;
  await updateUserProfile(uid, { xp: newXp });
  return newXp;
}
