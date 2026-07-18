import { del, get, post } from '../utils/request';
import type { Task } from './tasks';

export interface TaskSheet {
  id: number;
  title: string;
  date: string;
  applicant_openid: string;
  status: 'pending' | 'in_progress' | 'completed';
  total_tasks: number;
  completed_tasks: number;
  progress: number;
}

export function listTaskSheets(params: WechatMiniprogram.IAnyObject = {}) {
  return get<{ ok: true; sheets: TaskSheet[]; count: number }>(
    '/api/task-sheets',
    params
  );
}

export function getTaskSheet(id: number | string) {
  return get<{
    ok: true;
    sheet: TaskSheet;
    tasks: Task[];
    progress: WechatMiniprogram.IAnyObject;
  }>(`/api/task-sheets/${id}`);
}

export function createTaskSheet(data: {
  title: string;
  date: string;
  task_ids: number[];
  new_tasks?: Array<{
    title: string;
    description?: string;
    points: number;
  }>;
}) {
  return post<{ ok: true; sheet: TaskSheet; created_task_ids: number[] }>(
    '/api/task-sheets',
    data
  );
}

export function syncTaskSheet(id: number | string) {
  return post<{ ok: true; sheet: TaskSheet; progress: WechatMiniprogram.IAnyObject }>(
    `/api/task-sheets/${id}/sync-progress`
  );
}

export function deleteTaskSheet(id: number | string) {
  return del<{ ok: true }>(`/api/task-sheets/${id}`);
}
