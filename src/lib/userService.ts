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
