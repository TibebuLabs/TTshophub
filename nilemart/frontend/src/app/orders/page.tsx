'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import Guard from '@/components/Guard';
import { Confirm, Empty, Skeleton, StatusPill } from '@/components/ui';
import { api } from '@/lib/api';
import { etb, FLOW, PAYMENTS } from '@/lib/format';
import { useCart, useNotif, useToast } from '@/lib/store';
import type { Order } from '@/lib/types';
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  KeyRound,
  MapPin,
  Package,
  PhoneCall,
  RotateCcw,
  ShieldCheck,
  Truck,
  XCircle,
} from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';

export default function OrdersPage() {
  return (
    <Guard role="customer">
      <Orders />
    </Guard>
  );
}

function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [cancel, setCancel] = useState<Order | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const latest = useNotif((s) => s.items[0]?.id);
  const toast = useToast((s) => s.show);
  const add = useCart((s) => s.add);

  const load = useCallback(
    () =>
      api<Order[]>('/orders/mine')
        .then(setOrders)
        .catch(() => setOrders([])),
    [],
  );

  useEffect(() => {
    load();
  }, [load, latest]);

  const doCancel = async (o: Order) => {
    try {
      await api(`/orders/${o.id}/cancel`, { method: 'PATCH' });
      toast('Order cancelled successfully');
      load();
    } catch (e: any) {
      toast(e.message);
    }
  };

  const handleReorder = (o: Order) => {
    let count = 0;
    for (const item of o.items) {
      // Mock minimal product for reorder
      const dummyProduct: any = {
        id: item.productId,
        name: item.name,
        price: item.price,
        oldPrice: item.price,
        stock: 99,
        category: 'Reorder',
        images: [],
        seller: 'ShopHub Partner',
        description: '',
        rating: 5,
        ratingCount: 1,
        featured: false,
      };
      if (add(dummyProduct, item.qty)) count++;
    }
    toast(`Added ${count} items back to your cart!`);
  };

  if (!orders) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <Empty
        icon={<Package className="h-8 w-8 text-brand" />}
        title="No orders yet"
        text="Your orders and live tracking will appear here once you make your first purchase."
      >
        <Link href="/" className="btn btn-primary">
          Start shopping
        </Link>
      </Empty>
    );
  }

  const filteredOrders = orders.filter((o) => {
    if (filter === 'active') return !['delivered', 'cancelled'].includes(o.status);
    if (filter === 'delivered') return o.status === 'delivered';
    if (filter === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-ink">My Orders &amp; Live Tracking</h1>
          <p className="text-xs text-mute">Monitor order progress and delivery timelines in real-time.</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex rounded-xl border border-line bg-card p-1 text-xs font-bold">
          {(['all', 'active', 'delivered', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-3 py-1.5 capitalize transition ${
                filter === tab
                  ? 'bg-brand text-white shadow-soft'
                  : 'text-mute hover:text-ink'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="card p-8 text-center text-mute text-sm">
          No orders match the &ldquo;{filter}&rdquo; filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((o) => {
            const flowIndex = FLOW.indexOf(o.status as (typeof FLOW)[number]);
            const isCancelled = o.status === 'cancelled';
            const isDelivered = o.status === 'delivered';
            const isActive = !isCancelled && !isDelivered;
            const pinCode = (parseInt(o.code.replace(/\D/g, '') || '4892') % 9000 + 1000).toString();

            return (
              <div
                key={o.id}
                className="card overflow-hidden p-5 bg-card border-line shadow-soft hover:shadow-medium transition"
              >
                {/* Header Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-black text-ink">{o.code}</span>
                    <StatusPill status={o.status} />
                    {o.paid ? (
                      <span className="pill pill-green text-[10px] font-bold">Paid Online</span>
                    ) : (
                      <span className="pill pill-yellow text-[10px] font-bold">Cash on Delivery</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-mute">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Items Summary */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink">
                  <CategoryIcon category="" className="h-4 w-4 text-brand flex-none" />
                  <span>
                    {o.items.map((i) => `${i.name} (×${i.qty})`).join(' · ')}
                  </span>
                </div>

                {/* Interactive Visual Timeline */}
                {!isCancelled && (
                  <div className="my-5 rounded-2xl bg-bg/60 p-4 border border-line/60">
                    <div className="relative flex justify-between">
                      {FLOW.map((step, idx) => {
                        const isDone = idx <= flowIndex;
                        const isCurrent = idx === flowIndex;

                        return (
                          <div key={step} className="flex flex-1 flex-col items-center text-center relative z-10">
                            <div
                              className={`grid h-8 w-8 place-items-center rounded-full text-xs font-black transition-all ${
                                isDone
                                  ? 'bg-brand text-white shadow-md'
                                  : 'bg-card border-2 border-line text-mute'
                              } ${isCurrent ? 'ring-4 ring-brand/20 scale-110' : ''}`}
                            >
                              {isDone ? <Check className="h-4 w-4" /> : idx + 1}
                            </div>
                            <span
                              className={`mt-2 text-[11px] capitalize ${
                                isDone ? 'font-bold text-ink' : 'text-mute'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                      {/* Connecting progress line */}
                      <div className="absolute top-4 left-6 right-6 -z-0 h-0.5 bg-line">
                        <div
                          className="h-full bg-brand transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (flowIndex / (FLOW.length - 1)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Courier Dispatch Card */}
                {isActive && (
                  <div className="my-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/5 via-card to-amber-500/5 p-3.5">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-brand/10 text-brand">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-ink">
                          Courier: <strong className="text-brand">Abebe Kebede</strong> (Express Dispatch)
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-mute">
                          <MapPin className="h-3 w-3 text-brand" />
                          <span>Delivering to {o.city} · {o.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="rounded-xl border border-line bg-card px-2.5 py-1 text-center">
                        <span className="block text-[9px] font-bold uppercase text-mute">Delivery OTP</span>
                        <code className="font-mono text-xs font-black text-ink">{pinCode}</code>
                      </div>
                      <button
                        type="button"
                        onClick={() => toast(`Simulating phone call to Courier Abebe (+251 91 123 4567)…`)}
                        className="btn btn-outline btn-sm font-bold text-xs"
                      >
                        <PhoneCall className="h-3.5 w-3.5 mr-1 text-emerald-600" /> Call Courier
                      </button>
                    </div>
                  </div>
                )}

                {/* Cancelled Banner */}
                {isCancelled && (
                  <div className="my-3 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-xs text-red-600">
                    <XCircle className="h-4 w-4 flex-none" />
                    <span>This order has been cancelled and any reserved items have been returned to stock.</span>
                  </div>
                )}

                {/* Footer Info & Actions */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-xs">
                  <div className="text-mute">
                    <span>Payment: </span>
                    <strong className="text-ink uppercase">
                      {PAYMENTS.find((p) => p.id === o.payment)?.name || o.payment}
                    </strong>
                    <span> · Total: </span>
                    <strong className="text-sm font-black text-brand">{etb(o.total)}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleReorder(o)}
                      className="btn btn-outline btn-sm font-bold"
                      title="Add these items to your cart"
                    >
                      <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reorder
                    </button>

                    {['placed', 'confirmed'].includes(o.status) && (
                      <button
                        className="btn btn-outline btn-sm font-bold text-red-500 hover:border-red-500 hover:text-red-600"
                        onClick={() => setCancel(o)}
                      >
                        Cancel order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Confirm
        open={!!cancel}
        label="Confirm cancellation"
        text={`Are you sure you want to cancel order ${cancel?.code}? Any reserved stock will be immediately released.`}
        onClose={() => setCancel(null)}
        onYes={() => cancel && doCancel(cancel)}
      />
    </div>
  );
}
