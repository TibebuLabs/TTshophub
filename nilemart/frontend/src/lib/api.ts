import { useAuth } from './store';
import { useEffect, useState } from 'react';
import { FALLBACK } from './format';
import type { AppConfig } from './types';

export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Add timeout wrapper for fetch requests
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 30000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    throw error;
  }
}

export async function api<T>(path: string, opts: { method?: string; json?: unknown; formData?: FormData } = {}): Promise<T> {
  const token = useAuth.getState().token;
  const headers: Record<string, string> = {};
  if (opts.json !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try { 
    res = await fetchWithTimeout(
      API + path, 
      { 
        method: opts.method || 'GET', 
        headers, 
        body: opts.formData ?? (opts.json !== undefined ? JSON.stringify(opts.json) : undefined), 
        cache: 'no-store' 
      },
      30000 // 30 second timeout
    ); 
  }
  catch (error: any) { 
    if (error.message.includes('timed out')) {
      throw error; // Re-throw timeout errors with custom message
    }
    throw new Error('Cannot reach the server. Check your connection.'); 
  }
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
