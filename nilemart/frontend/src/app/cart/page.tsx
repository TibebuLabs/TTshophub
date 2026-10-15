'use client';
import Link from 'next/link';
import { Empty } from '@/components/ui';
import { useConfig } from '@/lib/api';
import { etb } from '@/lib/format';
import { cartSubtotal, useCart, useHydrated } from '@/lib/store';
import { BadgeCheck, Minus, Plus, ShieldCheck, ShoppingCart, Sparkles, Trash2 } from 'lucide-react';
import ProductArtwork from '@/components/ProductArtwork';

export default function CartPage() {
  const h = useHydrated(), cfg = useConfig(), { lines, setQty, remove, clear } = useCart();
  if (!h) return null;
  if (!lines.length) return <Empty icon={<ShoppingCart className="h-8 w-8 text-brand" />} title="Your cart is empty" text="Discover Ethiopian coffee, fashion, tech and more."><Link href="/" className="btn btn-primary">Start shopping</Link></Empty>;
  const sub = cartSubtotal(lines), left = Math.max(0, cfg.freeShippingOver - sub), itemCount = lines.reduce((a, l) => a + l.qty, 0);
  return (
    <div className="grid gap-6 pb-10 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Cart</p>
            <h1 className="mt-1 text-2xl font-black text-ink">Your basket</h1>
          </div>
          <button className="text-sm font-semibold text-red-500 hover:text-red-600" onClick={clear}>Clear all</button>
        </div>

        <div className="card mb-4 overflow-hidden border-brand/20 bg-gradient-to-r from-brand/10 via-white to-amber-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand text-white shadow-soft">
                <Sparkles aria-hidden="true" className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-extrabold text-ink">Smart delivery savings</p>
                {left ? (
                  <p className="text-sm text-mute">Add <b className="text-ink">{etb(left)}</b> more for free nationwide delivery.</p>
                ) : (
                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600"><BadgeCheck aria-hidden="true" className="h-4 w-4" />Free delivery unlocked</p>
                )}
              </div>
            </div>
            <div className="text-sm font-bold text-brand">{Math.min(100, (sub / cfg.freeShippingOver) * 100).toFixed(0)}%</div>
          </div>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-line/80">
            <div className="h-full rounded-full bg-gradient-to-r from-brand to-amber-400 transition-all" style={{ width: `${Math.min(100, (sub / cfg.freeShippingOver) * 100)}%` }} />
          </div>
        </div>

        <div className="card divide-y divide-line overflow-hidden">
          {lines.map(({ product: p, qty }) => (
            <div key={p.id} className="flex items-center gap-3 p-3 sm:p-4">
              <Link href={`/products/${p.id}`} className="relative h-20 w-20 flex-none overflow-hidden rounded-2xl bg-brand/10 ring-1 ring-line">
                <ProductArtwork product={p} className="absolute inset-0" iconClassName="h-8 w-8 text-brand/70" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${p.id}`} className="line-clamp-2 text-sm font-extrabold text-ink hover:text-brand">{p.name}</Link>
                <p className="mt-1 text-xs text-mute">{p.seller}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="flex items-center rounded-xl border border-line bg-bg text-sm shadow-sm">
                    <button className="px-2.5 py-1.5 text-mute transition hover:text-brand" onClick={() => setQty(p.id, qty - 1)} aria-label="Decrease quantity"><Minus aria-hidden="true" className="h-3.5 w-3.5" /></button>
                    <span className="w-7 text-center font-black text-ink">{qty}</span>
                    <button className="px-2.5 py-1.5 text-mute transition hover:text-brand" onClick={() => setQty(p.id, qty + 1)} aria-label="Increase quantity"><Plus aria-hidden="true" className="h-3.5 w-3.5" /></button>
                  </div>
                  <button className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600" onClick={() => remove(p.id)}><Trash2 aria-hidden="true" className="h-3.5 w-3.5" />Remove</button>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-ink">{etb(p.price * qty)}</div>
                <div className="mt-1 text-[11px] text-mute">{etb(p.price)} each</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="card h-fit p-4 shadow-soft lg:sticky lg:top-24 sm:p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-ink">Order summary</h2>
          <span className="rounded-full bg-brand/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-brand">{itemCount} items</span>
        </div>

        <div className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between"><span className="text-mute">Subtotal</span><b>{etb(sub)}</b></div>
          <div className="flex justify-between"><span className="text-mute">Delivery</span><span>{left ? 'Calculated at checkout' : 'FREE'}</span></div>
          <div className="flex justify-between"><span className="text-mute">Buyer protection</span><span className="text-emerald-600">Included</span></div>
        </div>

        <div className="mt-4 rounded-2xl border border-line bg-bg/60 p-3">
          <div className="flex items-center gap-2 text-xs font-bold text-mute uppercase tracking-[0.15em]">
            <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5 text-emerald-600" />Secure checkout
          </div>
          <p className="mt-2 text-sm text-mute">Encrypted payment, real-time tracking, and trusted Ethiopian delivery partners.</p>
        </div>

        <Link href="/checkout" className="btn btn-primary mt-5 w-full !py-3.5 text-sm font-black">Proceed to checkout</Link>
        <Link href="/" className="mt-2 block text-center text-sm font-semibold text-mute hover:text-brand">Continue shopping</Link>
      </aside>
    </div>
  );
}
