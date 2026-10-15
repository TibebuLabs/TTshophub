'use client';
import { useEffect, useState } from 'react';
import { FLOW } from '@/lib/format';
import type { ReactNode } from 'react';
import { Star, X } from 'lucide-react';

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: string; children: React.ReactNode }) {
  useEffect(() => { const f = (e: KeyboardEvent) => e.key === 'Escape' && onClose(); if (open) addEventListener('keydown', f); return () => removeEventListener('keydown', f); }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 sm:items-center sm:p-4" onClick={onClose}>
      <div className="card max-h-[92vh] w-full animate-up overflow-auto rounded-b-none p-5 sm:max-w-lg sm:rounded-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="mb-2 flex items-center justify-between"><h3 className="text-lg font-extrabold">{title}</h3><button className="btn btn-outline btn-sm" onClick={onClose} aria-label="Close"><X aria-hidden="true" className="h-4 w-4" /></button></div>
        {children}
      </div>
    </div>
  );
}

export function Confirm({ open, text, label = 'Delete', onYes, onClose }: { open: boolean; text: string; label?: string; onYes: () => void; onClose: () => void }) {
  return (<Modal open={open} onClose={onClose} title="Are you sure?"><p className="text-mute">{text}</p><div className="mt-4 flex gap-2"><button className="btn btn-outline flex-1" onClick={onClose}>Cancel</button><button className="btn btn-danger flex-1" onClick={() => { onYes(); onClose(); }}>{label}</button></div></Modal>);
}

export const Skeleton = ({ className = '' }: { className?: string }) => <div className={`relative overflow-hidden rounded-xl bg-line/60 ${className}`}><div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent" /></div>;

export const Empty = ({ icon, title, text, children }: { icon: ReactNode; title: string; text?: string; children?: ReactNode }) => (
  <div className="card mx-auto my-8 max-w-md p-8 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand/10">{icon}</div><h3 className="mt-3 text-lg font-extrabold">{title}</h3>{text && <p className="mt-1 text-sm text-mute">{text}</p>}<div className="mt-4">{children}</div></div>
);

export const Stat = ({ value, label, tone }: { value: string | number; label: string; tone?: string }) => (<div className="card p-4"><div className={`text-2xl font-extrabold ${tone || ''}`}>{value}</div><div className="text-xs text-mute">{label}</div></div>);

export function StatusPill({ status }: { status: string }) {
  const c = status === 'cancelled' ? 'pill-red' : status === 'delivered' ? 'pill-green' : '';
  return <span className={`pill capitalize ${c}`}>{status}</span>;
}

export function Timeline({ status }: { status: string }) {
  if (status === 'cancelled') return null;
  const i = FLOW.indexOf(status as (typeof FLOW)[number]);
  return (<div className="my-3 flex">{FLOW.map((s, k) => (<div key={s} className="flex-1 text-center text-[10px] sm:text-xs"><div className={`mx-auto mb-1 h-3 w-3 rounded-full ${k <= i ? 'bg-brand' : 'bg-line'}`} /><span className={`capitalize ${k <= i ? 'font-bold' : 'text-mute'}`}>{s}</span></div>))}</div>);
}

export function Countdown() {
  const [t, setT] = useState('--:--:--');
  useEffect(() => { const f = () => { const n = new Date(), e = new Date(n); e.setHours(23, 59, 59, 999); const d = Math.floor((+e - +n) / 1e3); setT([Math.floor(d / 3600), Math.floor(d / 60) % 60, d % 60].map((v) => String(v).padStart(2, '0')).join(':')); }; f(); const i = setInterval(f, 1000); return () => clearInterval(i); }, []);
  return <span className="rounded-lg bg-navy px-2.5 py-0.5 font-mono font-bold tabular-nums text-yellow-300">{t}</span>;
}

export const Stars = ({ r }: { r: number }) => <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`${r} out of 5`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} aria-hidden="true" className={`h-3.5 w-3.5 ${i < Math.round(r) ? 'fill-current' : 'fill-transparent'}`} />)}</span>;
