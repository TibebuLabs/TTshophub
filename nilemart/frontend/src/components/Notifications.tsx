'use client';
import { useEffect, useRef, useState } from 'react';
import { API, api } from '@/lib/api';
import { ago, beep } from '@/lib/format';
import { useAuth, useNotif, useToast } from '@/lib/store';
import type { Notif } from '@/lib/types';
import {
  Bell as BellIcon,
  Package,
  PackageCheck,
  PackageX,
  TriangleAlert,
  UserRound,
} from 'lucide-react';

/** Opens one SSE connection while signed in – admins get new-order alerts, customers get status updates. */
export function LiveNotifications() {
  const token = useAuth((s) => s.token);
  useEffect(() => {
    if (!token) { useNotif.getState().set([]); return; }
    api<Notif[]>('/notifications').then((l) => useNotif.getState().set(l)).catch(() => {});
    const es = new EventSource(`${API}/notifications/stream?token=${token}`);
    es.onmessage = (e) => { const n: Notif = JSON.parse(e.data); useNotif.getState().add(n); useToast.getState().show(n.title); beep(); };
    return () => es.close();
  }, [token]);
  return null;
}

export function Bell() {
  const { items, readAll } = useNotif(), user = useAuth((s) => s.user);
  const [open, setOpen] = useState(false), ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => !n.read).length;
  useEffect(() => { const f = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false); document.addEventListener('mousedown', f); return () => document.removeEventListener('mousedown', f); }, []);
  const toggle = () => { setOpen(!open); if (!open && unread) api('/notifications/read', { method: 'PATCH' }).then(readAll).catch(() => {}); };
  return (
    <div ref={ref} className="relative">
      <button onClick={toggle} className="relative rounded-xl p-2 text-lg hover:bg-white/10" aria-label="Notifications"><BellIcon aria-hidden="true" className="h-5 w-5" />{unread > 0 && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-brand px-1.5 text-[10px] font-extrabold">{unread}</span>}</button>
      {open && (
        <div className="card fixed inset-x-3 top-16 z-50 max-h-[70vh] animate-up overflow-auto p-1 text-ink shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
          <div className="px-3 py-2 text-sm font-extrabold">Notifications</div>
          {items.length === 0 && <p className="p-4 text-center text-sm text-mute">{user?.role === 'admin' ? 'New orders will appear here instantly.' : 'Order updates will appear here.'}</p>}
          {items.map((n) => {
            const Icon = n.type === 'order'
              ? PackageCheck
              : n.type === 'cancel'
                ? PackageX
                : n.type === 'stock'
                  ? TriangleAlert
                  : n.type === 'user'
                    ? UserRound
                    : Package;
            return (
              <div key={n.id} className={`flex gap-2 rounded-xl px-3 py-2 text-sm ${n.read ? 'opacity-60' : 'bg-brand/10'}`}>
                <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none text-brand" />
                <div className="min-w-0">
                  <div className="font-semibold">{n.title}</div>
                  {n.body && <div className="text-xs text-mute">{n.body}</div>}
                  <div className="text-[11px] text-mute">{ago(n.createdAt)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
