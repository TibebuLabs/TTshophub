import { useAuth } from './store';
import { useEffect, useState } from 'react';
import { FALLBACK } from './format';
import type { AppConfig } from './types';

export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export async function api<T>(path: string, opts: { method?: string; json?: unknown; formData?: FormData } = {}): Promise<T> {
  const token = useAuth.getState().token;
  const headers: Record<string, string> = {};
  if (opts.json !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try { res = await fetch(API + path, { method: opts.method || 'GET', headers, body: opts.formData ?? (opts.json !== undefined ? JSON.stringify(opts.json) : undefined), cache: 'no-store' }); }
  catch { throw new Error('Cannot reach the server. Check your connection.'); }
  const data = await res.json().catch(() => null);
  if (res.status === 401 && token) useAuth.getState().logout();
  if (!res.ok) {
    const message = Array.isArray(data?.message) ? data.message[0] : data?.message;
    if (
      (res.status === 502 || res.status === 503 || res.status === 504) &&
      (typeof message !== 'string' || !message)
    ) {
      throw new Error('ShopHub is temporarily unable to reach this service. Please try again shortly.');
    }
    throw new Error(typeof message === 'string' && message ? message : 'Something went wrong');
  }
  return data as T;
}

let cache: AppConfig | null = null;
export function useConfig(): AppConfig {
  const [c, setC] = useState<AppConfig>(cache ?? FALLBACK);
  useEffect(() => { if (!cache) api<AppConfig>('/config').then((x) => { cache = x; setC(x); }).catch(() => {}); }, []);
  return c;
}
