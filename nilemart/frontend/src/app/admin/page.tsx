'use client';
import { useEffect, useState } from 'react';
import { Skeleton, Stat, StatusPill } from '@/components/ui';
import { api } from '@/lib/api';
import { ago, etb } from '@/lib/format';
import { useNotif } from '@/lib/store';
import type { Order, Product } from '@/lib/types';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Clock3, MapPin, Package } from 'lucide-react';

interface Stats { revenue: number; orders: number; toFulfil: number; cancelled: number; byCity: { city: string; total: number }[]; pipeline: { status: string; count: number }[] }

function Bars({ rows, money }: { rows: { label: string; value: number }[]; money?: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return <div className="space-y-2">{rows.map((r) => <div key={r.label} className="flex items-center gap-2 text-xs"><span className="w-20 flex-none capitalize sm:w-24">{r.label}</span><div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(r.value / max) * 100}%` }} /></div><b className="w-20 text-right">{money ? etb(r.value) : r.value}</b></div>)}{!rows.length && <p className="text-sm text-mute">No data yet</p>}</div>;
}

export default function Dashboard() {
  const [s, setS] = useState<Stats | null>(null), [low, setLow] = useState<Product[]>([]), [recent, setRecent] = useState<Order[]>([]), latest = useNotif((n) => n.items[0]?.id);
  useEffect(() => { api<Stats>('/orders/stats').then(setS); api<Product[]>('/products').then((p) => setLow(p.filter((x) => x.stock <= 3))); api<Order[]>('/orders').then((o) => setRecent(o.slice(0, 5))); }, [latest]); // live-refresh on new notification
  if (!s) return <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20" />)}</div>;
  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-brand/15 bg-gradient-to-r from-brand/10 via-white to-amber-50 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand">Operations overview</p>
            <h1 className="mt-1 text-2xl font-black text-ink">Store performance</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Live & healthy
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat value={etb(s.revenue)} label="Paid revenue" /><Stat value={s.orders} label="Orders" /><Stat value={s.toFulfil} label="To fulfil" tone="text-brand" /><Stat value={low.length} label="Low stock" tone={low.length ? 'text-red-500' : ''} /></div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4"><h2 className="mb-3 flex items-center gap-2 font-extrabold"><MapPin aria-hidden="true" className="h-4 w-4 text-brand" />Sales by city</h2><Bars money rows={s.byCity.map((c) => ({ label: c.city, value: c.total }))} /></div>
        <div className="card p-4"><h2 className="mb-3 flex items-center gap-2 font-extrabold"><Package aria-hidden="true" className="h-4 w-4 text-brand" />Order pipeline</h2><Bars rows={s.pipeline.map((p) => ({ label: p.status, value: p.count }))} /></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4"><h2 className="mb-2 flex items-center gap-2 font-extrabold"><AlertTriangle aria-hidden="true" className="h-4 w-4 text-amber-500" />Restock soon</h2>{low.map((p) => <div key={p.id} className="flex justify-between border-b border-line py-1.5 text-sm last:border-0"><span>{p.name}</span><b className="text-red-500">{p.stock} left</b></div>)}{!low.length && <p className="text-sm text-mute">All products are well stocked</p>}<Link href="/admin/products" className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-brand">Manage products <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></div>
        <div className="card p-4"><h2 className="mb-2 flex items-center gap-2 font-extrabold"><Clock3 aria-hidden="true" className="h-4 w-4 text-brand" />Latest orders</h2>{recent.map((o) => <div key={o.id} className="flex items-center justify-between gap-2 border-b border-line py-1.5 text-sm last:border-0"><span><b>{o.code}</b> · {o.customerName}<br /><span className="text-xs text-mute">{ago(o.createdAt)}</span></span><span className="text-right"><b>{etb(o.total)}</b><br /><StatusPill status={o.status} /></span></div>)}{!recent.length && <p className="text-sm text-mute">No orders yet</p>}<Link href="/admin/orders" className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-brand">All orders <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link></div>
      </div>
    </div>
  );
}
