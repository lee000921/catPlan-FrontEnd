import { get, post } from '../utils/request';

export type FeedbackCategory = 'bug' | 'experience' | 'feature' | 'other';
export type FeedbackStatus =
  | 'new'
  | 'triaged'
  | 'fixing'
  | 'resolved'
  | 'closed'
  | 'rejected';

export interface FeedbackReport {
  id: number;
  category: FeedbackCategory;
  title: string;
  description: string;
  reproduction_steps?: string | null;
  expected_result?: string | null;
  actual_result?: string | null;
  page_path?: string | null;
  app_version?: string | null;
  status: FeedbackStatus;
  severity: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
}

export interface CreateFeedbackInput {
  category: FeedbackCategory;
  title: string;
  description: string;
  reproduction_steps?: string;
  expected_result?: string;
  actual_result?: string;
  page_path?: string;
  app_version?: string;
  client_context?: WechatMiniprogram.IAnyObject;
}

interface CreateFeedbackResponse {
  ok: true;
  feedback: FeedbackReport;
}

interface MyFeedbackResponse {
  ok: true;
  feedback: FeedbackReport[];
  total: number;
  has_more: boolean;
}

export function createFeedback(
  input: CreateFeedbackInput
): Promise<CreateFeedbackResponse> {
  return post<CreateFeedbackResponse>('/api/feedback', input);
}

export function getMyFeedback(
  limit = 20,
  offset = 0
): Promise<MyFeedbackResponse> {
  return get<MyFeedbackResponse>('/api/feedback/mine', { limit, offset });
}
