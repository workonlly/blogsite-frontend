'use client';

export const ADMIN_AUTH_KEY = 'blog_admin_auth';
export const ADMIN_SESSION_TTL_MS = Number(process.env.NEXT_PUBLIC_ADMIN_SESSION_MINUTES || '30') * 60 * 1000;
export const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin';
export const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

export interface AdminSession {
  username: string;
  expiresAt: number;
}

export function createAdminSession(username: string): AdminSession {
  return {
    username,
    expiresAt: Date.now() + ADMIN_SESSION_TTL_MS,
  };
}

export function readAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(ADMIN_AUTH_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as AdminSession;
    if (!session?.username || typeof session.expiresAt !== 'number') {
      window.localStorage.removeItem(ADMIN_AUTH_KEY);
      return null;
    }

    if (session.expiresAt <= Date.now()) {
      window.localStorage.removeItem(ADMIN_AUTH_KEY);
      return null;
    }

    return session;
  } catch {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
    return null;
  }
}

export function saveAdminSession(session: AdminSession) {
  window.localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  window.localStorage.removeItem(ADMIN_AUTH_KEY);
}

export function isValidAdminCredentials(username: string, password: string) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
