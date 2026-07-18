import { clearSession, getSession } from './session';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestConfig {
  url: string;
  method?: HttpMethod;
  data?: WechatMiniprogram.IAnyObject;
  header?: Record<string, string>;
  timeout?: number;
  authenticated?: boolean;
}

interface BackendError {
  code?: string;
  message?: string;
}

interface BackendEnvelope {
  ok?: boolean;
  error?: BackendError | string;
}

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(
    message: string,
    options: { statusCode?: number; code?: string; details?: unknown } = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = options.statusCode || 0;
    this.code = options.code || 'REQUEST_FAILED';
    this.details = options.details;
  }
}

let redirectingToLogin = false;

function getApiBaseUrl(): string {
  const app = getApp<{
    globalData?: { backendBase?: string };
  }>();
  const baseUrl = app?.globalData?.backendBase || '';
  if (!baseUrl) {
    throw new ApiError('后端地址未配置', { code: 'API_BASE_URL_MISSING' });
  }
  return baseUrl.replace(/\/+$/, '');
}

function errorFromResponse(
  statusCode: number,
  data: BackendEnvelope | undefined
): ApiError {
  const backendError = data?.error;
  if (typeof backendError === 'string') {
    return new ApiError(backendError, {
      statusCode,
      code: `HTTP_${statusCode}`,
      details: data,
    });
  }
  return new ApiError(
    backendError?.message || (statusCode >= 500 ? '服务暂时不可用' : '请求失败'),
    {
      statusCode,
      code: backendError?.code || `HTTP_${statusCode}`,
      details: data,
    }
  );
}

function handleUnauthorized(): void {
  clearSession();
  if (redirectingToLogin) return;
  redirectingToLogin = true;
  wx.showToast({ title: '登录已过期，请重新登录', icon: 'none' });
  setTimeout(() => {
    wx.reLaunch({
      url: '/pages/login/login',
      complete: () => {
        redirectingToLogin = false;
      },
    });
  }, 500);
}

export function request<T extends BackendEnvelope = BackendEnvelope>(
  config: RequestConfig
): Promise<T> {
  return new Promise((resolve, reject) => {
    const authenticated = config.authenticated !== false;
    const session = getSession();
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...config.header,
    };

    if (authenticated) {
      if (!session?.token) {
        handleUnauthorized();
        reject(
          new ApiError('请先登录', {
            statusCode: 401,
            code: 'AUTH_REQUIRED',
          })
        );
        return;
      }
      headers.Authorization = `Bearer ${session.token}`;
    }

    let baseUrl: string;
    try {
      baseUrl = getApiBaseUrl();
    } catch (error) {
      reject(error);
      return;
    }

    wx.request({
      url: `${baseUrl}${config.url}`,
      method: config.method || 'GET',
      data: config.data,
      header: headers,
      timeout: config.timeout || 10000,
      success(response) {
        const statusCode = response.statusCode;
        const data = response.data as T;

        if (statusCode >= 200 && statusCode < 300 && data?.ok !== false) {
          resolve(data);
          return;
        }

        if (statusCode === 401) handleUnauthorized();
        reject(errorFromResponse(statusCode, data));
      },
      fail(error) {
        reject(
          new ApiError('网络连接失败，请稍后重试', {
            code: 'NETWORK_ERROR',
            details: error,
          })
        );
      },
    });
  });
}

export function get<T extends BackendEnvelope>(
  url: string,
  data?: WechatMiniprogram.IAnyObject,
  authenticated = true
): Promise<T> {
  return request<T>({ url, data, authenticated });
}

export function post<T extends BackendEnvelope>(
  url: string,
  data?: WechatMiniprogram.IAnyObject,
  authenticated = true
): Promise<T> {
  return request<T>({ url, method: 'POST', data, authenticated });
}

export function put<T extends BackendEnvelope>(
  url: string,
  data?: WechatMiniprogram.IAnyObject
): Promise<T> {
  return request<T>({ url, method: 'PUT', data });
}

export function del<T extends BackendEnvelope>(
  url: string,
  data?: WechatMiniprogram.IAnyObject
): Promise<T> {
  return request<T>({ url, method: 'DELETE', data });
}

export function getErrorMessage(error: unknown, fallback = '操作失败'): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
