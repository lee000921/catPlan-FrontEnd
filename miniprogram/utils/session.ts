export type UserRole = 'A' | 'B' | 'AB';

export interface Session {
  token: string;
  openid: string;
  userType: UserRole;
  userInfo: WechatMiniprogram.UserInfo | null;
}

const SESSION_KEY = 'catplan_session';
const LEGACY_KEYS = [
  'catplan_token',
  'token',
  'catplan_user_openid',
  'catplan_user_type',
  'catplan_user',
  'userInfo',
  'points',
];

function isUserRole(value: unknown): value is UserRole {
  return value === 'A' || value === 'B' || value === 'AB';
}

function isSession(value: unknown): value is Session {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Session>;
  return (
    typeof candidate.token === 'string' &&
    candidate.token.length > 0 &&
    typeof candidate.openid === 'string' &&
    candidate.openid.length > 0 &&
    isUserRole(candidate.userType)
  );
}

function readLegacySession(): Session | null {
  const token =
    wx.getStorageSync<string>('catplan_token') ||
    wx.getStorageSync<string>('token');
  const openid = wx.getStorageSync<string>('catplan_user_openid');
  const rawRole = wx.getStorageSync<string>('catplan_user_type');
  const userInfo =
    wx.getStorageSync<WechatMiniprogram.UserInfo>('catplan_user') ||
    wx.getStorageSync<WechatMiniprogram.UserInfo>('userInfo') ||
    null;

  if (!token || !openid || !isUserRole(rawRole)) return null;
  return { token, openid, userType: rawRole, userInfo };
}

export function getSession(): Session | null {
  const stored = wx.getStorageSync<Session>(SESSION_KEY);
  if (isSession(stored)) return stored;

  const legacy = readLegacySession();
  if (legacy) {
    wx.setStorageSync(SESSION_KEY, legacy);
    return legacy;
  }
  return null;
}

export function saveSession(session: Session): void {
  if (!isSession(session)) {
    throw new Error('Cannot save an invalid session');
  }
  wx.setStorageSync(SESSION_KEY, session);
}

export function updateSession(patch: Partial<Session>): Session | null {
  const current = getSession();
  if (!current) return null;
  const updated = { ...current, ...patch };
  saveSession(updated);
  return updated;
}

export function clearSession(): void {
  wx.removeStorageSync(SESSION_KEY);
  LEGACY_KEYS.forEach(key => wx.removeStorageSync(key));
}

export function hasRole(session: Session | null, role: 'A' | 'B'): boolean {
  return session?.userType === role || session?.userType === 'AB';
}

export const sessionStorageKey = SESSION_KEY;
