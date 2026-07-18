import { get, post } from '../utils/request';
import type { UserRole } from '../utils/session';

export interface LoginResponse {
  ok: true;
  openid: string;
  token: string;
  user_type: UserRole;
  mock?: boolean;
}

export interface ProfileResponse {
  ok: true;
  user: WechatMiniprogram.UserInfo | null;
  points?: number;
  user_type?: UserRole;
}

export interface PointsHistoryRecord {
  id: number;
  points_change: number;
  balance: number;
  reason: string;
  created_at: string;
}

export interface PointsHistoryResponse {
  ok: true;
  records: PointsHistoryRecord[];
  has_more: boolean;
}

export function login(code: string): Promise<LoginResponse> {
  return post<LoginResponse>('/api/auth/login', { code }, false);
}

export function getProfile(): Promise<ProfileResponse> {
  return get<ProfileResponse>('/api/user/profile');
}

export function getPointsHistory(
  limit = 20,
  offset = 0
): Promise<PointsHistoryResponse> {
  return get<PointsHistoryResponse>('/api/user/points-history', {
    limit,
    offset,
  });
}

export function updateProfile(
  profile: WechatMiniprogram.UserInfo
): Promise<ProfileResponse> {
  return post<ProfileResponse>('/api/user/profile', { profile });
}
