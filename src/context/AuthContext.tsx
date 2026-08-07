import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import {
  signUp as svcSignUp,
  logIn as svcLogIn,
  logOut as svcLogOut,
  subscribeToAuthChanges,
  type AppUser,
} from '@/lib/authService';
import { getUserProfile, updateUserProfile } from '@/lib/userService';
import { localAuth, usingLocalAuth } from '@/lib/localAuth';
import type { UserProfile } from '@/types';

interface AuthContextValue {
  user: AppUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ ok: boolean; error?: string }>;
  logIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  usingLocal: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const p = await getUserProfile(user.uid);
    setProfile(p);
  }, [user]);

  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) return;
      await updateUserProfile(user.uid, updates);
      await refreshProfile();
    },
    [user, refreshProfile]
  );

  useEffect(() => {
    const unsub = subscribeToAuthChanges(async (u) => {
      setUser(u);
      if (u) {
        const p = await getUserProfile(u.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // Keep local auth display name in sync when profile updates
  useEffect(() => {
    if (usingLocalAuth && user && profile) {
      const users = JSON.parse(localStorage.getItem('vocal_hero_local_users') || '[]');
      const updated = users.map((u: { uid: string; displayName: string }) =>
        u.uid === user.uid ? { ...u, displayName: profile.displayName } : u
      );
      localStorage.setItem('vocal_hero_local_users', JSON.stringify(updated));
    }
  }, [user, profile]);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const res = await svcSignUp(email, password, displayName);
    return res;
  }, []);

  const logIn = useCallback(async (email: string, password: string) => {
    return svcLogIn(email, password);
  }, []);

  const logOut = useCallback(async () => {
    await svcLogOut();
    setUser(null);
    setProfile(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        logIn,
        logOut,
        refreshProfile,
        updateProfile,
        usingLocal: usingLocalAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
