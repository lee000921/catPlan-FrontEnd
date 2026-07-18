import { get, post } from '../utils/request';

export function getSigninHistory(month: string) {
  return get<{
    ok: true;
    days: string[];
    consecutive_days: number;
  }>('/api/signin/history', { month });
}

export function checkin() {
  return post<{
    ok: true;
    day: string;
    inserted: boolean;
    consecutive_days: number;
    points_earned: number;
    total_points: number;
  }>('/api/signin/checkin');
}
