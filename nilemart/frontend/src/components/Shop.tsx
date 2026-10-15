'use client';
import { useEffect, useMemo, useState } from 'react';
import { api, useConfig } from '@/lib/api';
import { CAT_ICON, discount, MOCK_PRODUCTS } from '@/lib/format';
import { useAuth, useHydrated } from '@/lib/store';
import type { Product } from '@/lib/types';
import Link from 'next/link';
import ProductCard from './ProductCard';
import { Countdown, Empty, Skeleton } from './ui';
import { Banknote, Coffee, Gift, MapPin, Package, Search, ShieldCheck, Shirt, Smartphone, Truck, X, Zap } from 'lucide-react';

const SLIDES = [
  { bg: 'from-navy via-navy-700 to-blue-900', icon: Coffee, title: "Ethiopia's best,\ndelivered to your door", text: 'Coffee, honey, hand-woven fashion and tech from trusted local sellers.', cat: '' },
  { bg: 'from-orange-700 via-brand to-amber-500', icon: Smartphone, title: 'Mega tech deals', text: 'Phones, laptops and solar power banks — up to 35% off.', cat: 'Electronics' },
  { bg: 'from-emerald-900 via-emerald-700 to-teal-500', icon: Shirt, title: 'Made by Ethiopian hands', text: 'Habesha kemis, netela, leather bags and crafts.', cat: 'Fashion' },
];
const BENEFITS = [
  { icon: Banknote, title: 'Cash on delivery', text: 'Pay when your order arrives' },
  { icon: Truck, title: 'Nationwide delivery', text: 'Same-day in Addis' },
  { icon: ShieldCheck, title: 'Buyer protection', text: '14-day returns' },
  { icon: MapPin, title: 'Local sellers first', text: 'Support Ethiopian makers' },
];

function applyProductFilters(products: Product[], q: string, category: string, max: string, sort: string): Product[] {
  let next = [...products];
  const query = q.trim().toLowerCase();

  if (query) {
    next = next.filter((product) =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.seller.toLowerCase().includes(query),
    );
  }

  if (category) {
    next = next.filter((product) => product.category === category);
  }

  if (max) {
    next = next.filter((product) => product.price <= Number(max));
  }

  switch (sort) {
    case 'priceAsc':
      next.sort((a, b) => a.price - b.price);
      break;
    case 'priceDesc':
      next.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      next.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount);
      break;
    case 'newest':
      next.sort((a, b) => (b.featured === a.featured ? 0 : Number(b.featured) - Number(a.featured)));
      break;
    default:
      next.sort((a, b) => (b.featured === a.featured ? b.rating - a.rating : Number(b.featured) - Number(a.featured)));
      break;
  }

  return next;
}

export default function Shop({ q, category }: { q: string; category: string }) {
  const cfg = useConfig(), h = useHydrated(), user = useAuth((s) => s.user);
  const [cat, setCat] = useState(category), [sort, setSort] = useState('popular'), [max, setMax] = useState(''), [giftBudget, setGiftBudget] = useState('3000'), [items, setItems] = useState<Product[] | null>(null), [all, setAll] = useState<Product[]>([]), [slide, setSlide] = useState(0), [err, setErr] = useState('');
  useEffect(() => setCat(category), [category]);
  useEffect(() => { const i = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000); return () => clearInterval(i); }, []);
  useEffect(() => {
    setItems(null); setErr('');
    const p = new URLSearchParams({ sort }); if (q) p.set('q', q); if (cat) p.set('category', cat); if (max) p.set('max', max);
    api<Product[]>('/products?' + p).then((r) => {
      const filtered = applyProductFilters(r, q, cat, max, sort);
      setItems(filtered);
      if (!q && !cat && !max && sort === 'popular') {
        setAll(r);
      }
    }).catch((e) => {
      const fallback = applyProductFilters(MOCK_PRODUCTS, q, cat, max, sort);
      setItems(fallback);
      setAll(MOCK_PRODUCTS);
      setErr(e.message.includes('Cannot reach the server') ? 'Live catalog is offline, so the storefront is showing the demo catalog until the backend syncs.' : e.message);
    });
  }, [q, cat, sort, max]);
  const home = !q && !cat && !max;
  const deals = useMemo(() => all.filter((p) => discount(p) >= 28 && p.stock > 0).slice(0, 6), [all]);
  const s = SLIDES[slide];
  const SlideIcon = s.icon;
  return (
    <div className="space-y-6">
      {home && (
        <section className={`relative grid min-h-[230px] items-center gap-4 overflow-hidden rounded-3xl bg-gradient-to-r ${s.bg} p-6 text-white transition-all duration-700 sm:p-10 md:grid-cols-[1.3fr_1fr]`}>
          <div>
            <h1 className="whitespace-pre-line text-3xl font-extrabold leading-tight sm:text-5xl">{s.title}</h1>
            <p className="mt-2 max-w-md text-white/85">{s.text}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="btn btn-primary" onClick={() => { setCat(s.cat); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }}>Shop now →</button>
              {h && !user && <Link href="/register" className="btn border border-white/40 text-white hover:bg-white/10">Create account</Link>}
            </div>
            <div className="mt-5 flex gap-1.5">{SLIDES.map((_, i) => <button key={i} aria-label={`Slide ${i + 1}`} onClick={() => setSlide(i)} className={`h-2 rounded-full transition-all ${i === slide ? 'w-7 bg-brand' : 'w-2 bg-white/40'}`} />)}</div>
          </div>
          <div className="hidden select-none place-items-center text-white/90 drop-shadow-2xl md:grid"><SlideIcon aria-hidden="true" className="h-40 w-40 stroke-[1.1]" /></div>
        </section>
      )}

      <section className="no-scrollbar -mx-3 flex gap-2.5 overflow-x-auto px-3 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-6" aria-label="Categories">
        {cfg.categories.map((c) => {
          const Icon = CAT_ICON[c] || Package;
          return (
            <button key={c} onClick={() => { setCat(cat === c ? '' : c); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }} className={`card flex min-w-[104px] flex-none flex-col items-center gap-1 px-3 py-3 text-xs font-bold transition hover:-translate-y-1 hover:border-brand sm:min-w-0 sm:text-sm ${cat === c ? 'border-brand bg-brand/10' : ''}`}>
              <Icon aria-hidden="true" className="h-8 w-8 text-brand" strokeWidth={1.7} />{c}
            </button>
          );
        })}
      </section>

      {home && (
        <section className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card flex items-center gap-3 p-3"><Icon aria-hidden="true" className="h-7 w-7 flex-none text-brand" /><div className="text-sm font-bold leading-tight">{title}<div className="text-xs font-normal text-mute">{text}</div></div></div>
          ))}
        </section>
      )}

      {home && (
        <section className="relative overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-br from-violet-50 via-white to-amber-50 p-5 shadow-soft sm:p-7">
          <div className="absolute -right-10 -top-12 h-48 w-48 rounded-full bg-brand/10 blur-3xl" aria-hidden="true" />
          <div className="relative grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-brand"><Gift aria-hidden="true" className="h-4 w-4" /> Thoughtful gifts, made easy</span>
              <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">Find a gift they’ll love</h2>
              <p className="mt-1 max-w-xl text-sm text-mute">Explore hand-picked Gift Finds from local makers and trusted sellers. Choose a budget to see ideas that fit.</p>
            </div>
            <div className="relative flex flex-col gap-2 sm:flex-row md:min-w-[330px] md:flex-col">
              <label className="sr-only" htmlFor="gift-budget">Gift budget</label>
              <select id="gift-budget" className="input !w-full bg-white" value={giftBudget} onChange={(event) => setGiftBudget(event.target.value)}>
                <option value="1000">Under ETB 1,000</option>
                <option value="3000">Under ETB 3,000</option>
                <option value="5000">Under ETB 5,000</option>
                <option value="10000">Under ETB 10,000</option>
              </select>
              <button className="btn btn-primary whitespace-nowrap" onClick={() => { setCat('Gift Finds'); setMax(giftBudget); document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' }); }}>
                <Gift aria-hidden="true" className="mr-1.5 inline h-4 w-4" />Find gift ideas
              </button>
            </div>
          </div>
        </section>
      )}

      {home && deals.length > 0 && (
        <section>
          <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl bg-gradient-to-r from-brand to-amber-400 px-4 py-2.5 text-white"><b className="flex items-center gap-1.5 text-lg"><Zap aria-hidden="true" className="h-5 w-5" />Flash deals</b><span className="text-sm">Ends in</span><Countdown /></div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{deals.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}

      <section id="shop" className="scroll-mt-28">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-extrabold">{q ? `Results for “${q}”` : cat || (home ? 'Picked for you' : 'Products')} <span className="text-sm font-normal text-mute">{items ? items.length : ''}</span></h2>
          <div className="flex gap-2">
            <select className="input !w-auto" value={max} onChange={(e) => setMax(e.target.value)} aria-label="Max price"><option value="">Any price</option><option value="1000">Under 1,000</option><option value="3000">Under 3,000</option><option value="10000">Under 10,000</option><option value="30000">Under 30,000</option></select>
            <select className="input !w-auto" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort"><option value="popular">Popular</option><option value="priceAsc">Price: low–high</option><option value="priceDesc">Price: high–low</option><option value="rating">Top rated</option><option value="newest">Newest</option></select>
          </div>
        </div>

        {/* Smart Discovery Filter Pills */}
        <div className="no-scrollbar mb-3 flex gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => { setCat(''); setMax(''); setSort('popular'); }}
            className={`rounded-full px-3 py-1 font-bold border transition ${
              !cat && !max && sort === 'popular'
                ? 'bg-brand text-white border-brand'
                : 'bg-card border-line text-mute hover:border-brand hover:text-brand'
            }`}
          >
            All Products
          </button>
          <button
            onClick={() => { setSort('rating'); }}
            className={`rounded-full px-3 py-1 font-bold border transition ${
              sort === 'rating'
                ? 'bg-brand text-white border-brand'
                : 'bg-card border-line text-mute hover:border-brand hover:text-brand'
            }`}
          >
            ⭐ Top Rated
          </button>
          <button
            onClick={() => { setCat('Coffee & Food'); }}
            className={`rounded-full px-3 py-1 font-bold border transition ${
              cat === 'Coffee & Food'
                ? 'bg-brand text-white border-brand'
                : 'bg-card border-line text-mute hover:border-brand hover:text-brand'
            }`}
          >
            ☕ Ethiopian Coffee
          </button>
          <button
            onClick={() => { setCat('Fashion'); }}
            className={`rounded-full px-3 py-1 font-bold border transition ${
              cat === 'Fashion'
                ? 'bg-brand text-white border-brand'
                : 'bg-card border-line text-mute hover:border-brand hover:text-brand'
            }`}
          >
            👗 Habesha Kemis
          </button>
          <button
            onClick={() => { setCat('Electronics'); }}
            className={`rounded-full px-3 py-1 font-bold border transition ${
              cat === 'Electronics'
                ? 'bg-brand text-white border-brand'
                : 'bg-card border-line text-mute hover:border-brand hover:text-brand'
            }`}
          >
            📱 Tech & Solar
          </button>
          <button
            onClick={() => { setMax('1000'); }}
            className={`rounded-full px-3 py-1 font-bold border transition ${
              max === '1000'
                ? 'bg-brand text-white border-brand'
                : 'bg-card border-line text-mute hover:border-brand hover:text-brand'
            }`}
          >
            🏷️ Under 1,000 ETB
          </button>
        </div>

        {(q || cat || max) && <button className="btn btn-outline btn-sm mb-3" onClick={() => { setCat(''); setMax(''); history.replaceState(null, '', '/'); location.href = '/#shop'; }}><X aria-hidden="true" className="mr-1 inline h-4 w-4" />Clear filters</button>}
        {err && <div className="card border-red-500/40 p-4 text-sm text-red-500"><Search aria-hidden="true" className="mr-1 inline h-4 w-4" />{err}</div>}
        {items === null ? <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-64" />)}</div>
          : items.length === 0 && !err ? <Empty icon={<Search className="h-8 w-8 text-brand" />} title="No products found" text="Try another word, a higher budget or a different category." />
          : <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>}
      </section>
    </div>
  );
}
