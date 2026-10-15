'use client';
import { useCallback, useEffect, useState } from 'react';
import { Confirm, Empty, Modal, Skeleton, StatusPill, Timeline } from '@/components/ui';
import { api } from '@/lib/api';
import { ago, etb, FLOW, PAYMENTS } from '@/lib/format';
import { useNotif, useToast } from '@/lib/store';
import type { Order } from '@/lib/types';
import { MapPin, PackageOpen, Search } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null), [q, setQ] = useState(''), [status, setStatus] = useState(''), [view, setView] = useState<Order | null>(null), [cancel, setCancel] = useState<Order | null>(null), latest = useNotif((n) => n.items[0]?.id), toast = useToast((s) => s.show);
  const load = useCallback(() => { const p = new URLSearchParams(); if (q) p.set('q', q); if (status) p.set('status', status); return api<Order[]>('/orders?' + p).then(setOrders).catch((e) => toast(e.message)); }, [q, status, toast]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load, latest]);
  const advance = async (o: Order) => { try { const n = await api<Order>(`/orders/${o.id}/advance`, { method: 'PATCH' }); toast(`${o.code} → ${n.status}`); setView(null); load(); } catch (e: any) { toast(e.message); } };
  const doCancel = async (o: Order) => { try { await api(`/orders/${o.id}/cancel`, { method: 'PATCH' }); toast('Order cancelled'); setView(null); load(); } catch (e: any) { toast(e.message); } };
  const next = (o: Order) => FLOW[FLOW.indexOf(o.status as (typeof FLOW)[number]) + 1];
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2"><label className="relative min-w-[200px] flex-1"><Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" /><input className="input pl-9" placeholder="Order code, customer, city" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search orders" /></label><select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{[...FLOW, 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
      {!orders ? <Skeleton className="h-48" /> : !orders.length ? <Empty icon={<PackageOpen className="h-8 w-8 text-brand" />} title="No orders found" /> : (
        <div className="space-y-2">{orders.map((o) => (
          <div key={o.id} className="card flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-2 p-3 transition hover:border-brand" onClick={() => setView(o)}>
            <div className="min-w-[150px] flex-1"><b>{o.code}</b> <StatusPill status={o.status} /><div className="text-sm">{o.customerName} · {o.city}</div><div className="text-xs text-mute">{ago(o.createdAt)}</div></div>
            <div className="text-sm"><b>{etb(o.total)}</b><div><span className={`pill ${o.paid ? 'pill-green' : ''}`}>{o.paid ? 'Paid' : 'COD'}</span></div></div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>{next(o) && o.status !== 'cancelled' && <button className="btn btn-primary btn-sm" onClick={() => advance(o)}>→ {next(o)}</button>}</div>
          </div>))}</div>)}
      <Modal open={!!view} onClose={() => setView(null)} title={view?.code}>
        {view && <>
          <div className="flex items-center gap-2"><StatusPill status={view.status} /><span className={`pill ${view.paid ? 'pill-green' : ''}`}>{view.paid ? 'Paid' : 'Collect on delivery'}</span></div>
          <p className="mt-2 text-sm"><b>{view.customerName}</b> · {view.phone}<br /><MapPin aria-hidden="true" className="mr-1 inline h-4 w-4 text-brand" />{view.address}, {view.city}<br />{(() => { const PaymentIcon = PAYMENTS.find((p) => p.id === view.payment)?.icon; return PaymentIcon ? <PaymentIcon aria-hidden="true" className="mr-1 inline h-4 w-4 text-brand" /> : null; })()}{PAYMENTS.find((p) => p.id === view.payment)?.name}</p>
          <div className="mt-2 divide-y divide-line text-sm">{view.items.map((i) => <div key={i.productId} className="flex justify-between py-1"><span>{i.name} ×{i.qty}</span><span>{etb(i.price * i.qty)}</span></div>)}<div className="flex justify-between py-1 text-mute"><span>Delivery</span><span>{view.shipping ? etb(view.shipping) : 'FREE'}</span></div><div className="flex justify-between py-1 text-base font-extrabold"><span>Total</span><span>{etb(view.total)}</span></div></div>
          <Timeline status={view.status} />
          <div className="mt-2 flex gap-2">{next(view) && view.status !== 'cancelled' && <button className="btn btn-primary flex-1" onClick={() => advance(view)}>Mark {next(view)}</button>}{!['cancelled', 'delivered'].includes(view.status) && <button className="btn btn-outline" onClick={() => setCancel(view)}>Cancel order</button>}</div>
        </>}
      </Modal>
      <Confirm open={!!cancel} label="Cancel order" text={`Cancel ${cancel?.code}? Stock is returned and the customer is notified.`} onClose={() => setCancel(null)} onYes={() => cancel && doCancel(cancel)} />
    </div>
  );
}
