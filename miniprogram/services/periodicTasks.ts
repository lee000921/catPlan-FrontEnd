import { post } from '../utils/request';

export type PeriodicType = 'daily' | 'weekly' | 'monthly';

export function createPeriodicTask(data: {
  title: string;
  description?: string;
  points: number;
  periodic_type: PeriodicType;
  periodic_config: WechatMiniprogram.IAnyObject;
  start_date: string;
  end_date?: string;
}) {
  return post<{ ok: true; periodic_task: WechatMiniprogram.IAnyObject }>(
    '/api/periodic-tasks',
    data
  );
}
