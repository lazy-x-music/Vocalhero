import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import { localAuth } from './localAuth';
import { createUserDocument } from './userService';

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

function toAppUser(u: FirebaseUser): AppUser {
  return { uid: u.uid, email: u.email, displayName: u.displayName };
}

export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResult> {
  if (!email || !password) return { ok: false, error: 'Email and password are required.' };

  if (isFirebaseConfigured && auth) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName) {
        await updateProfile(cred.user, { displayName });
      }
      await createUserDocument(cred.user.uid, displayName || email, email);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: friendlyAuthError(e) };
    }
  }

  // Local fallback
  const res = localAuth.signUp(email, password, displayName);
  if (!res.ok) return res;
  await createUserDocument(res.uid!, displayName || email, email);
  return { ok: true };
}

export async function logIn(email: string, password: string): Promise<AuthResult> {
  if (!email || !password) return { ok: false, error: 'Email and password are required.' };

  if (isFirebaseConfigured && auth) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: friendlyAuthError(e) };
    }
  }

  return localAuth.signIn(email, password);
}

export async function logOut(): Promise<void> {
  if (isFirebaseConfigured && auth) {
    await signOut(auth);
  } else {
    localAuth.signOut();
  }
}

export function subscribeToAuthChanges(cb: (user: AppUser | null) => void): () => void {
  if (isFirebaseConfigured && auth) {
    return onAuthStateChanged(auth, (u) => cb(u ? toAppUser(u) : null));
  }
  return localAuth.subscribe(cb);
}

function friendlyAuthError(e: unknown): string {
  const code = (e as { code?: string })?.code ?? '';
  const map: Record<string, string> = {
    'auth/invalid-email': 'That email address looks invalid.',
    'auth/email-already-in-use': 'An account already exists for this email.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/user-not-found': 'No account found for this email.',
    'auth/wrong-password': 'Email or password is incorrect.',
    'auth/too-many-requests': 'Too many attempts. Try again in a moment.',
  };
  return map[code] || 'Something went wrong. Please try again.';
}
