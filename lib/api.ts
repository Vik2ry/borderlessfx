'use client';

const API_BASE = process.env.API_BASE_URL || 'http://unbordered-production.up.railway.app/api';

async function parseJson(res: Response) {
  const text = await res.text();
  try { return text ? JSON.parse(text) : null; } catch { return text; }
}

async function refreshToken(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
    const refresh = localStorage.getItem('refresh');
  if (!refresh) return false;
  const url = (process.env.API_BASE || 'http://unbordered-production.up.railway.app') + '/auth/refresh/';
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!r.ok) return false;
    const data = await r.json();
    if (data.access) localStorage.setItem('access', data.access);
    if (data.refresh) localStorage.setItem('refresh', data.refresh);
    return true;
  } catch (e) {
    console.error('refreshToken error', e);
    return false;
  }
}

export default async function apiFetch(endpoint: string, options: RequestInit = {}, retry = true) {
  const access = (typeof window !== 'undefined') ? localStorage.getItem('access') : null;
  const headers: Record<string,string> = { 'Content-Type': 'application/json', ...(options.headers || {}) as any };
  if (access) headers['Authorization'] = `Bearer ${access}`;
  const full = API_BASE.replace(/\/$/, '') + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);
  const res = await fetch(full, { ...options, headers });
  if (res.status === 401 && retry) {
    const ok = await refreshToken();
    if (ok) return apiFetch(endpoint, options, false);
  }
  if (!res.ok) {
    const parsed = await parseJson(res).catch(() => null);
    const msg = parsed && (parsed.detail || parsed.message) ? (parsed.detail || parsed.message) : `${res.status} ${res.statusText}`;
    const err: any = new Error(msg);
    err.status = res.status;
    err.body = parsed;
    throw err;
  }
  return parseJson(res);
}
