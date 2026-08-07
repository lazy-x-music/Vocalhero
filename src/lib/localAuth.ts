import { isFirebaseConfigured } from './firebase';

const USERS_KEY = 'vocal_hero_local_users';
const SESSION_KEY = 'vocal_hero_local_session';
const PASSWORDS_KEY = 'vocal_hero_local_passwords';

interface StoredUser {
  uid: string;
  email: string;
  displayName: string;
}

function readUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readPasswords(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(PASSWORDS_KEY) || '{}');
  } catch {
    return {};
  }
}

function writePasswords(p: Record<string, string>) {
  localStorage.setItem(PASSWORDS_KEY, JSON.stringify(p));
}

type Listener = (user: { uid: string; email: string; displayName: string } | null) => void;
const listeners = new Set<Listener>();

function emit() {
  const session = localStorage.getItem(SESSION_KEY);
  const users = readUsers();
  const current = session ? users.find((u) => u.uid === session) ?? null : null;
  listeners.forEach((l) => l(current));
}

export const localAuth = {
  signUp(email: string, password: string, displayName: string): { ok: boolean; error?: string; uid?: string } {
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { ok: false, error: 'An account already exists for this email.' };
    }
    const uid = 'local-' + Math.random().toString(36).slice(2, 12);
    const user: StoredUser = { uid, email, displayName: displayName || email };
    users.push(user);
    writeUsers(users);
    const passwords = readPasswords();
    passwords[uid] = password;
    writePasswords(passwords);
    localStorage.setItem(SESSION_KEY, uid);
    emit();
    return { ok: true, uid };
  },

  signIn(email: string, password: string): { ok: boolean; error?: string } {
    const users = readUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) return { ok: false, error: 'No account found for this email.' };
    const passwords = readPasswords();
    if (passwords[user.uid] !== password) return { ok: false, error: 'Email or password is incorrect.' };
    localStorage.setItem(SESSION_KEY, user.uid);
    emit();
    return { ok: true };
  },

  signOut() {
    localStorage.removeItem(SESSION_KEY);
    emit();
  },

  current(): { uid: string; email: string; displayName: string } | null {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return null;
    return readUsers().find((u) => u.uid === session) ?? null;
  },

  subscribe(cb: Listener): () => void {
    listeners.add(cb);
    cb(localAuth.current());
    const handler = () => emit();
    window.addEventListener('storage', handler);
    return () => {
      listeners.delete(cb);
      window.removeEventListener('storage', handler);
    };
  },
};

export const usingLocalAuth = !isFirebaseConfigured;
