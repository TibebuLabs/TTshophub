'use client';

import Link from 'next/link';
import { useState } from 'react';
import Guard from '@/components/Guard';
import { Empty } from '@/components/ui';
import { api, useConfig } from '@/lib/api';
import { etb, PAYMENTS } from '@/lib/format';
import { cartSubtotal, useAuth, useCart, useHydrated, useToast } from '@/lib/store';
import type { Order } from '@/lib/types';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  MapPin,
  Phone,
  QrCode,
  ShieldCheck,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Tag,
  Truck,
  X,
} from 'lucide-react';

const LANDMARKS = [
  'Bole Edna Mall',
  'Kazanchis UNECA',
  'Piassa Churchill Ave',
  'Mexico Square',
  'Megenagna Plaza',
  'Sarbet AU HQ',
  'CMC Michael',
  '22 Mazoria',
];

const VALID_PROMOS: Record<string, { type: 'percent' | 'flat' | 'free_shipping'; value: number; label: string }> = {
  HABESHA15: { type: 'percent', value: 15, label: '15% Off Cart' },
  FREESHIP: { type: 'free_shipping', value: 0, label: 'Free Delivery Across Ethiopia' },
  WELCOME200: { type: 'flat', value: 200, label: 'ETB 200 Welcome Gift' },
};

export default function CheckoutPage() {
  return (
    <Guard role="customer">
      <Checkout />
    </Guard>
  );
}

function Checkout() {
  const hydrated = useHydrated();
  const config = useConfig();
  const user = useAuth((state) => state.user)!;
  const { lines, clear } = useCart();
  const toast = useToast((state) => state.show);

  const [details, setDetails] = useState({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
    city: 'Addis Ababa',
    address: '',
    payment: 'telebirr',
  });

  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; type: 'percent' | 'flat' | 'free_shipping'; value: number; label: string } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [telebirrSimulating, setTelebirrSimulating] = useState(false);
  const [telebirrApproved, setTelebirrApproved] = useState(false);
  const [cbeSimulating, setCbeSimulating] = useState(false);
  const [cbeApproved, setCbeApproved] = useState(false);
  const [chapaProcessing, setChapaProcessing] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!hydrated) return null;
  if (!lines.length && !placedOrder) {
    return (
      <Empty icon={<ShoppingCart className="h-8 w-8 text-brand" />} title="Your cart is empty">
        <Link href="/" className="btn btn-primary">Shop now</Link>
      </Empty>
    );
  }

  const subtotal = cartSubtotal(lines);
  const city = config.cities[details.city] ?? config.cities['Addis Ababa'];
  let shipping = subtotal >= config.freeShippingOver ? 0 : city.fee;

  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discountAmount = Math.round((subtotal * appliedPromo.value) / 100);
    } else if (appliedPromo.type === 'flat') {
      discountAmount = Math.min(subtotal, appliedPromo.value);
    } else if (appliedPromo.type === 'free_shipping') {
      shipping = 0;
    }
  }

  const total = Math.max(0, subtotal - discountAmount + shipping);
  const freeShippingProgress = Math.min(100, (subtotal / config.freeShippingOver) * 100);

  function update<K extends keyof typeof details>(field: K, value: (typeof details)[K]) {
    setDetails((current) => ({ ...current, [field]: value }));
    if (field === 'payment' && value !== 'telebirr') setTelebirrApproved(false);
    if (field === 'payment' && value !== 'cbe') setCbeApproved(false);
  }

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    if (VALID_PROMOS[code]) {
      setAppliedPromo({ code, ...VALID_PROMOS[code] });
      setPromoInput('');
      toast(`Promo code ${code} applied successfully!`);
    } else {
      setPromoError('Invalid coupon code. Try HABESHA15 or FREESHIP');
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoError('');
    toast('Promo code removed');
  };

  const simulateTelebirrPush = () => {
    setTelebirrSimulating(true);
    setTimeout(() => {
      setTelebirrSimulating(false);
      setTelebirrApproved(true);
      toast('Payment confirmed via Telebirr SuperApp! ✓');
    }, 1800);
  };

  const simulateCbePush = () => {
    setCbeSimulating(true);
    setTimeout(() => {
      setCbeSimulating(false);
      setCbeApproved(true);
      toast('CBE Birr USSD request authorized! ✓');
    }, 1800);
  };

  const beginChapaFlow = () => {
    setChapaProcessing(true);
    toast('Secure Chapa checkout is initializing...');
    setTimeout(() => {
      setChapaProcessing(false);
      setDetails((current) => ({ ...current, payment: 'chapa' }));
      toast('Chapa secure checkout ready. You can complete the order now.');
    }, 1200);
  };

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    const normalizedPhone = details.phone.replace(/\s/g, '');
    if (details.name.trim().length < 3) {
      setError('Enter your full name.');
      return;
    }
    if (!/^(\+251|0)?[79]\d{8}$/.test(normalizedPhone)) {
      setError('Enter a valid Ethiopian phone number (09… or +251…).');
      return;
    }
    if (details.address.trim().length < 3) {
      setError('Enter your delivery address or select a nearby landmark.');
      return;
    }
    if (details.payment === 'telebirr' && !telebirrApproved) {
      setError('Confirm the Telebirr prompt before placing your order.');
      return;
    }
    if (details.payment === 'cbe' && !cbeApproved) {
      setError('Authorize the CBE Birr request before placing your order.');
      return;
    }
    if (busy) return;

    setBusy(true);
    try {
      if (details.payment === 'chapa') {
        setChapaProcessing(true);
        await new Promise((resolve) => setTimeout(resolve, 1200));
      }

      const order = await api<Order>('/orders', {
        method: 'POST',
        json: {
          items: lines.map((line) => ({
            productId: line.product.id,
            qty: line.qty,
          })),
          customerName: details.name.trim(),
          phone: normalizedPhone,
          address: details.address.trim(),
          city: details.city,
          payment: details.payment,
        },
      });

      clear();
      setPlacedOrder(order);
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : 'Unable to place your order. Please try again.';
      setError(message);
      toast('Order could not be placed');
    } finally {
      setBusy(false);
      setChapaProcessing(false);
    }
  }

  if (placedOrder) {
    return (
      <section className="mx-auto my-8 max-w-2xl animate-scaleIn">
        <div className="card overflow-hidden border border-line bg-card p-6 shadow-2xl sm:p-8">
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <span className="pill pill-green mt-3 text-xs font-bold uppercase tracking-wider">
              {placedOrder.paid ? 'Payment Verified & Confirmed' : 'Order Placed (COD)'}
            </span>
            <h1 className="mt-2 text-2xl font-black text-ink sm:text-3xl">Thank You for Your Order!</h1>
            <p className="mt-1 text-sm text-mute">
              Your order <strong className="font-black text-brand">{placedOrder.code}</strong> is registered and being prepared.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-line bg-bg/50 p-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-mute">ShopHub Official Receipt</span>
                <p className="text-sm font-black text-ink">Order Ref: {placedOrder.code}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-mute">{new Date(placedOrder.createdAt).toLocaleDateString()}</span>
                <p className="text-xs font-bold uppercase text-brand">{placedOrder.payment}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-mute">Customer Name:</span>
                <strong className="text-ink">{placedOrder.customerName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-mute">Destination City:</span>
                <strong className="text-ink">{placedOrder.city} ({city.eta})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-mute">Delivery Address:</span>
                <span className="max-w-[200px] truncate text-right text-ink">{placedOrder.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mute">Contact Phone:</span>
                <span className="text-ink">{placedOrder.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-mute">Payment Status:</span>
                <span className={`font-black ${placedOrder.paid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {placedOrder.paid ? 'PAID ONLINE' : 'PAY ON DELIVERY'}
                </span>
              </div>
            </div>

            <div className="mt-4 border-t border-line pt-3">
              <div className="flex justify-between text-sm font-black">
                <span>Grand Total:</span>
                <span className="text-base text-brand">{etb(placedOrder.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/orders" className="btn btn-primary flex-1 sm:flex-none">
              <Truck className="mr-1.5 h-4 w-4" /> Track Live Order
            </Link>
            <Link href="/" className="btn btn-outline flex-1 sm:flex-none">Continue Shopping</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="pb-12">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/cart" className="inline-flex items-center gap-1 text-sm font-semibold text-mute hover:text-brand">
            <ArrowLeft className="h-4 w-4" /> Back to cart
          </Link>
          <h1 className="mt-1 text-2xl font-black text-ink">Smart Checkout</h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
          <LockKeyhole className="h-4 w-4" /> 256-bit Encrypted Checkout
        </span>
      </div>

      <div className="mb-5 grid gap-2 sm:grid-cols-4">
        {[
          { name: 'Cart', done: true },
          { name: 'Delivery', done: true },
          { name: 'Payment', done: false },
          { name: 'Confirm', done: false },
        ].map((step, index) => (
          <div
            key={step.name}
            className={`flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm font-bold ${
              index === 2 ? 'border-brand bg-brand/10 text-brand' : 'border-line bg-card text-mute'
            }`}
          >
            <span className={`grid h-7 w-7 place-items-center rounded-full text-[11px] ${index === 2 ? 'bg-brand text-white' : 'bg-bg text-ink'}`}>
              {index + 1}
            </span>
            {step.name}
          </div>
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <form id="checkout-form" className="space-y-5" onSubmit={submit} noValidate>
          <section className="card border border-line bg-card p-4 sm:p-6">
            <div className="mb-4 flex items-start gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-brand/10 text-brand">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-extrabold text-base text-ink">Delivery Destination</h2>
                <p className="text-xs text-mute">We deliver fast nationwide across all Ethiopian cities.</p>
              </div>
            </div>

            <div className="grid gap-x-4 gap-y-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="checkout-name">Full Name</label>
                <input id="checkout-name" className="input" value={details.name} onChange={(event) => update('name', event.target.value)} autoComplete="name" placeholder="e.g. Almaz Bekele" required />
              </div>

              <div>
                <label className="label" htmlFor="checkout-phone">Contact Phone (Ethiopian Mobile)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-mute" />
                  <input id="checkout-phone" className="input pl-9" type="tel" inputMode="tel" value={details.phone} onChange={(event) => update('phone', event.target.value)} autoComplete="tel" placeholder="0911223344" required />
                </div>
              </div>

              <div>
                <label className="label" htmlFor="checkout-city">Destination City</label>
                <select id="checkout-city" className="input font-semibold" value={details.city} onChange={(event) => update('city', event.target.value)}>
                  {Object.entries(config.cities).map(([name, delivery]) => (
                    <option key={name} value={name}>
                      {name} — {delivery.eta} ({etb(delivery.fee)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label" htmlFor="checkout-address">Specific Address or Landmark</label>
                <input id="checkout-address" className="input" placeholder="e.g. Bole Medhanialem, next to Edna Mall" value={details.address} onChange={(event) => update('address', event.target.value)} autoComplete="street-address" required />
              </div>
            </div>

            <div className="mt-3.5">
              <span className="text-[11px] font-bold text-mute">Quick Landmarks (Addis Ababa):</span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {LANDMARKS.map((lm) => (
                  <button key={lm} type="button" onClick={() => update('address', lm)} className="rounded-lg border border-line bg-bg/80 px-2.5 py-1 text-xs text-mute transition hover:border-brand hover:bg-card hover:text-brand">
                    + {lm}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="card border border-line bg-card p-4 sm:p-6">
            <div className="mb-4 flex items-start gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-brand/10 text-brand">
                <Smartphone className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-extrabold text-base text-ink">Ethiopian Payment Method</h2>
                <p className="text-xs text-mute">Choose how you wish to settle this order.</p>
              </div>
            </div>

            <div className="grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
              {PAYMENTS.map((method) => {
                const selected = details.payment === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => update('payment', method.id)}
                    className={`flex items-start gap-3 rounded-2xl border-2 p-3 text-left transition-all ${
                      selected ? 'border-brand bg-brand/10 shadow-soft' : 'border-line bg-card hover:border-brand/40'
                    }`}
                  >
                    <method.icon className="mt-0.5 h-5 w-5 flex-none text-brand" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <b className="text-sm font-extrabold text-ink">{method.name}</b>
                        {selected && <Check className="h-4 w-4 text-brand" />}
                      </div>
                      <span className="mt-0.5 block text-xs text-mute">{method.hint}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {details.payment === 'telebirr' && (
              <div className="mt-4 rounded-2xl border border-brand/30 bg-gradient-to-br from-amber-50/50 via-card to-brand/5 p-4 sm:p-5 dark:from-slate-800/60 dark:to-card">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <div className="relative grid h-28 w-28 flex-none place-items-center rounded-2xl border-2 border-brand/40 bg-white p-2 shadow-soft">
                    <QrCode className="h-24 w-24 text-slate-900" />
                    <span className="absolute bottom-1 rounded bg-brand px-1 text-[8px] font-black uppercase text-white">Telebirr</span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-brand" />
                      <span className="text-sm font-bold text-ink">Telebirr payment prompt</span>
                    </div>
                    <p className="mt-1 text-sm text-mute">
                      Open the Telebirr app, scan the QR, and confirm the payment before continuing.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={simulateTelebirrPush} className="btn btn-primary btn-sm" disabled={telebirrSimulating || telebirrApproved}>
                        {telebirrSimulating ? 'Awaiting confirmation...' : telebirrApproved ? 'Confirmed' : 'Confirm payment'}
                      </button>
                      {telebirrApproved && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-700">Approved</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {details.payment === 'cbe' && (
              <div className="mt-4 rounded-2xl border border-brand/30 bg-gradient-to-br from-sky-50/50 via-card to-brand/5 p-4 sm:p-5 dark:from-slate-800/60 dark:to-card">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <div className="grid h-28 w-28 flex-none place-items-center rounded-2xl border-2 border-brand/40 bg-white p-2 shadow-soft">
                    <CreditCard className="h-12 w-12 text-sky-600" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-brand" />
                      <span className="text-sm font-bold text-ink">CBE Birr authorization</span>
                    </div>
                    <p className="mt-1 text-sm text-mute">Approve the CBE Birr payment request sent to your mobile number for secure checkout.</p>
                    <div className="mt-3 flex gap-2">
                      <button type="button" onClick={simulateCbePush} className="btn btn-primary btn-sm" disabled={cbeSimulating || cbeApproved}>
                        {cbeSimulating ? 'Requesting approval...' : cbeApproved ? 'Authorized' : 'Authorize now'}
                      </button>
                      {cbeApproved && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-700">Approved</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {details.payment === 'chapa' && (
              <div className="mt-4 rounded-2xl border border-brand/30 bg-gradient-to-br from-indigo-50 via-card to-brand/5 p-4 sm:p-5 dark:from-slate-800/60 dark:to-card">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <div className="grid h-28 w-28 flex-none place-items-center rounded-2xl border-2 border-brand/40 bg-white p-2 shadow-soft">
                    <Sparkles className="h-12 w-12 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-brand" />
                      <span className="text-sm font-bold text-ink">Chapa secure checkout</span>
                    </div>
                    <p className="mt-1 text-sm text-mute">
                      Your order will be paid through Chapa with a secure provider-ready redirect flow once credentials are active.
                    </p>
                    <button type="button" onClick={beginChapaFlow} className="btn btn-primary btn-sm mt-3" disabled={chapaProcessing}>
                      {chapaProcessing ? 'Preparing secure gateway...' : 'Prepare Chapa checkout'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {details.payment === 'cod' && (
              <div className="mt-4 rounded-2xl border border-brand/30 bg-gradient-to-br from-amber-100/60 via-card to-brand/5 p-4 sm:p-5 dark:from-slate-800/60 dark:to-card">
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-brand" />
                  <p className="text-sm text-mute">Cash on delivery is available for the selected address. Payment is due when your package arrives.</p>
                </div>
              </div>
            )}
          </section>

          <section className="card border border-line bg-card p-4 sm:p-6">
            <div className="mb-4 flex items-start gap-3">
              <span className="grid h-10 w-10 flex-none place-items-center rounded-2xl bg-brand/10 text-brand">
                <Tag className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-extrabold text-base text-ink">Promo Code</h2>
                <p className="text-xs text-mute">Add a store discount for an even better deal.</p>
              </div>
            </div>

            <form onSubmit={applyPromo} className="flex flex-col gap-2 sm:flex-row">
              <input
                className="input flex-1"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                placeholder="Enter promo code"
                aria-label="Promo code"
              />
              <button type="submit" className="btn btn-outline">Apply</button>
            </form>

            {appliedPromo && (
              <div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-sm">
                <span>
                  <strong>{appliedPromo.code}</strong> · {appliedPromo.label}
                </span>
                <button type="button" onClick={removePromo} className="text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400">
                  Remove
                </button>
              </div>
            )}
            {promoError && <p className="mt-2 text-sm font-medium text-red-500">{promoError}</p>}
          </section>
        </form>

        <aside className="card sticky top-24 border border-line bg-card p-4 sm:p-5">
          <h2 className="text-lg font-black text-ink">Order Summary</h2>

          <div className="mt-4 space-y-3">
            {lines.map((line) => (
              <div key={line.product.id} className="flex items-center gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-line bg-bg/70">
                  <img
                    src={line.product.images?.[0] || '/placeholder.png'}
                    alt={line.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="line-clamp-2 text-sm font-bold text-ink">{line.product.name}</span>
                    <span className="text-sm font-black text-brand">{etb(line.product.price * line.qty)}</span>
                  </div>
                  <div className="mt-1 text-xs text-mute">Qty {line.qty}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-mute">Subtotal</span><b>{etb(subtotal)}</b></div>
            <div className="flex justify-between"><span className="text-mute">Delivery</span><b>{shipping === 0 ? 'FREE' : etb(shipping)}</b></div>
            {discountAmount > 0 && <div className="flex justify-between"><span className="text-mute">Discount</span><b>-{etb(discountAmount)}</b></div>}
            <div className="border-t border-line pt-2">
              <div className="flex justify-between text-base font-black text-ink">
                <span>Total</span>
                <span className="text-brand">{etb(total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-brand/20 bg-brand/5 p-3">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-mute">
              <span>Free delivery progress</span>
              <span>{Math.round(freeShippingProgress)}%</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-gradient-to-r from-brand to-amber-400 transition-all" style={{ width: `${freeShippingProgress}%` }} />
            </div>
            <p className="mt-2 text-xs text-mute">
              {subtotal >= config.freeShippingOver
                ? 'You unlocked free nationwide delivery.'
                : `Add ${etb(config.freeShippingOver - subtotal)} more for free delivery.`}
            </p>
          </div>

          <div className="mt-4 rounded-2xl bg-bg/60 p-3 text-xs text-mute">
            <div className="mb-1 flex items-center gap-2 font-bold text-ink">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure checkout
            </div>
            Your payment info is protected with 256-bit SSL encryption and trusted local payment partners.
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/20">
              <X className="mt-0.5 h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" form="checkout-form" className="btn btn-primary mt-5 w-full" disabled={busy || chapaProcessing}>
            {busy ? 'Placing order...' : chapaProcessing ? 'Preparing Chapa secure checkout...' : `Place order · ${etb(total)}`}
          </button>
        </aside>
      </div>
    </div>
  );
}