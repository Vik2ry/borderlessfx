'use client';
import { useEffect, useState, useCallback } from 'react';
import apiFetch from '@/lib/api';

export interface User { id?: string; handle?: string; email?: string; }

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [access, setAccess] = useState<string | null>(typeof window !== 'undefined' ? localStorage.getItem('access') : null);
  const [refresh, setRefresh] = useState<string | null>(typeof window !== 'undefined' ? localStorage.getItem('refresh') : null);
  const [loading, setLoading] = useState(false);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem('access');
    if (!token) return setUser(null);
    try {
      const me = await apiFetch('/auth/me/');
      setUser(me);
    } catch (e) {
      console.warn('useAuth: could not fetch /auth/me/', e);
      setUser(null);
    }
  }, []);

  useEffect(() => { if (access) loadMe(); }, [access, loadMe]);

  const login = async (handle: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || 'http://unbordered-production.up.railway.app') + '/auth/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: handle, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || data?.message || 'Login failed');
      if (data.access) { localStorage.setItem('access', data.access); setAccess(data.access); }
      if (data.refresh) { localStorage.setItem('refresh', data.refresh); setRefresh(data.refresh); }
      await loadMe();
      return data;
    } finally { setLoading(false); }
  };

  const register = async (handle: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_BASE || 'http://unbordered-production.up.railway.app') + '/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || data?.message || 'Register failed');
      return login(handle, password);
    } finally { setLoading(false); }
  };

  const logout = () => { localStorage.removeItem('access'); localStorage.removeItem('refresh'); setAccess(null); setRefresh(null); setUser(null); };

  return { user, access, refresh, loading, login, logout, register, reload: loadMe };
}
