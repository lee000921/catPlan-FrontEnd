import { get, post } from '../utils/request';

export interface Task {
  id: number;
  title: string;
  description: string;
  applicant_openid: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  points: number;
  scheduled_date?: string | null;
  is_periodic?: number | boolean;
  periodic_type?: 'daily' | 'weekly' | 'monthly' | null;
  created_at?: string;
  updated_at?: string;
  applicant_profile?: WechatMiniprogram.UserInfo | null;
}

interface TaskResponse {
  ok: true;
  task: Task;
  approvals?: WechatMiniprogram.IAnyObject[];
}

export function listTasks(params: WechatMiniprogram.IAnyObject = {}) {
  return get<{ ok: true; tasks: Task[]; count: number }>('/api/tasks', params);
}

export function getTask(id: number | string) {
  return get<TaskResponse>(`/api/tasks/${id}`);
}

export function createTask(data: {
  title: string;
  description?: string;
  points: number;
  scheduled_date?: string;
}) {
  return post<TaskResponse>('/api/tasks', data);
}

export function approveTask(
  id: number | string,
  status: 'approved' | 'rejected',
  comment = ''
) {
  return post<{ ok: true; task_id: number; status: string }>(
    `/api/tasks/${id}/approve`,
    { status, comment }
  );
}

export function completeTask(id: number | string) {
  return post<{
    ok: true;
    task_id: number;
    points_earned: number;
    current_balance: number;
  }>(`/api/tasks/${id}/complete`);
}
