'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductArtwork from '@/components/ProductArtwork';
import { Empty, Skeleton, Stars } from '@/components/ui';
import { api, useConfig } from '@/lib/api';
import { discount, etb } from '@/lib/format';
import { useAuth, useCart, useCompare, useToast, useWishlist } from '@/lib/store';
import type { Product } from '@/lib/types';
import {
  ArrowRight,
  Heart,
  MapPin,
  MessageSquarePlus,
  Minus,
  Package,
  Plus,
  Scale,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  ThumbsUp,
} from 'lucide-react';

interface ReviewItem {
  id: string;
  name: string;
  rating: number;
  comment: string;
  verified: boolean;
  date: string;
  helpful: number;
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: '1',
    name: 'Meron Tadesse',
    rating: 5,
    comment: 'Authentic Ethiopian quality! Fast same-day delivery right to our office in Bole. Highly recommended.',
    verified: true,
    date: '2 days ago',
    helpful: 14,
  },
  {
    id: '2',
    name: 'Dawit Abebe',
    rating: 4,
    comment: 'Very solid quality for the price. Packaging was intact and seller answered all questions.',
    verified: true,
    date: '1 week ago',
    helpful: 8,
  },
];

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const cfg = useConfig();
  const add = useCart((s) => s.add);
  const toast = useToast((s) => s.show);
  const user = useAuth((s) => s.user);

  const { toggle: toggleWish, has: inWish } = useWishlist();
  const { toggle: toggleComp, has: inComp } = useCompare();

  const [p, setP] = useState<Product | null>(null);
  const [rel, setRel] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const [city, setCity] = useState('Addis Ababa');
  const [selectedImage, setSelectedImage] = useState(0);
  const [err, setErr] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newAuthor, setNewAuthor] = useState(user?.name || '');

  useEffect(() => {
    setP(null);
    setSelectedImage(0);
    api<Product>(`/products/${id}`)
      .then((x) => {
        setP(x);
        api<Product[]>('/products?category=' + encodeURIComponent(x.category)).then((r) =>
          setRel(r.filter((y) => y.id !== x.id).slice(0, 4)),
        );
      })
      .catch(() => setErr(true));
  }, [id]);

  if (err) {
    return (
      <Empty icon={<Package className="h-8 w-8 text-brand" />} title="Product not found">
        <Link href="/" className="btn btn-primary">Back to shop</Link>
      </Empty>
    );
  }

  if (!p) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const eta = cfg.cities[city]?.eta ?? 'Same day';
  const fee = cfg.cities[city]?.fee ?? 120;
  const d = discount(p);
  const isWish = inWish(p.id);
  const isComp = inComp(p.id);

  const addNow = () => {
    if (add(p, qty)) toast(`${qty} × ${p.name} added to cart`);
    else toast(`Only ${p.stock} in stock`);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast('Product link copied to clipboard! 📋');
    }
  };

  const handleWishlist = () => {
    const isNow = toggleWish(p);
    toast(isNow ? 'Saved to Wishlist ❤️' : 'Removed from Wishlist');
  };

  const handleCompare = () => {
    const res = toggleComp(p);
    if (res.maxReached) toast('Max 3 items in compare list');
    else toast(res.added ? 'Added to compare list ⚖️' : 'Removed from compare list');
  };

  const handleHelpful = (reviewId: string) => {
    setReviews((current) => current.map((r) => (r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r)));
    toast('Thanks for your feedback!');
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !newAuthor.trim()) {
      toast('Please write a name and comment');
      return;
    }

    const createdReview: ReviewItem = {
      id: Date.now().toString(),
      name: newAuthor.trim(),
      rating: newRating,
      comment: newComment.trim(),
      verified: true,
      date: 'Just now',
      helpful: 0,
    };

    setReviews([createdReview, ...reviews]);
    setNewComment('');
    setShowReviewForm(false);
    toast('Thank you! Your verified review has been posted. ⭐');
  };

  return (
    <div className="pb-24 md:pb-12">
      <nav className="mb-5 flex items-center gap-2 text-xs text-mute" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-brand">Home</Link>
        <span>›</span>
        <Link href={`/?category=${encodeURIComponent(p.category)}#shop`} className="hover:text-brand">
          {p.category}
        </Link>
        <span>›</span>
        <span className="max-w-[200px] truncate font-semibold text-ink sm:max-w-none">{p.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-4">
          <div className="card relative h-[340px] overflow-hidden border border-line bg-gradient-to-br from-brand/10 via-card to-blue-500/10 shadow-soft sm:h-[520px]">
            {d > 0 && (
              <span className="absolute left-4 top-4 z-10 rounded-xl bg-red-600 px-3 py-1 text-xs font-black text-white shadow-md">
                -{d}% OFF
              </span>
            )}
            <div className="absolute inset-0 p-5">
              <img src={p.images[selectedImage] ?? p.images[0]} alt={p.name} className="h-full w-full rounded-2xl object-cover" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {p.images.map((img, index) => (
              <button
                key={`${p.id}-${index}`}
                type="button"
                onClick={() => setSelectedImage(index)}
                className={`overflow-hidden rounded-2xl border-2 transition ${
                  selectedImage === index ? 'border-brand shadow-soft' : 'border-line hover:border-brand/60'
                }`}
                aria-label={`View product image ${index + 1}`}
              >
                <img src={img} alt={`${p.name} view ${index + 1}`} className="h-20 w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="pill uppercase tracking-wider text-[10px] font-black">{p.category}</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleWishlist}
                className={`grid h-9 w-9 place-items-center rounded-full border transition ${
                  isWish
                    ? 'border-red-500 bg-red-50 text-red-500 dark:bg-red-950/40'
                    : 'border-line text-mute hover:border-red-400 hover:text-red-500'
                }`}
                title={isWish ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`h-4 w-4 ${isWish ? 'fill-current text-red-500' : ''}`} />
              </button>
              <button
                onClick={handleCompare}
                className={`grid h-9 w-9 place-items-center rounded-full border transition ${
                  isComp
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-line text-mute hover:border-brand hover:text-brand'
                }`}
                title="Compare product"
              >
                <Scale className="h-4 w-4" />
              </button>
              <button
                onClick={handleShare}
                className="grid h-9 w-9 place-items-center rounded-full border border-line text-mute transition hover:border-brand hover:text-brand"
                title="Share product link"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h1 className="mt-3 text-3xl font-black leading-tight text-ink sm:text-4xl">{p.name}</h1>
          {p.nameAm && <p className="mt-1 text-base font-semibold text-mute">{p.nameAm}</p>}

          <div className="mt-3 flex items-center gap-3">
            <Stars r={p.rating} />
            <span className="text-sm font-bold text-ink">{p.rating.toFixed(1)}</span>
            <span className="text-sm text-mute">({p.ratingCount.toLocaleString()} verified reviews)</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-black text-brand">{etb(p.price)}</span>
            {p.oldPrice > p.price && (
              <span className="text-base text-mute line-through">{etb(p.oldPrice)}</span>
            )}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink/80">
            {p.description || `Authentic, premium-grade ${p.category.toLowerCase()} selected for value and everyday use.`}
          </p>

          <div className="card mt-5 space-y-2.5 border border-line bg-bg/60 p-4 text-xs sm:text-sm">
            <div className="flex items-center justify-between gap-3">
              <span>
                Sold by <strong className="text-ink">{p.seller}</strong> · Fulfilled by ShopHub ET
              </span>
              <span className="pill pill-green text-[10px] font-bold">Verified Merchant</span>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-line/60 pt-2 text-ink">
              <MapPin className="h-4 w-4 text-brand" />
              <span>Deliver to:</span>
              <select
                className="input !w-auto !py-1 text-xs font-bold"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                aria-label="Delivery city"
              >
                {Object.keys(cfg.cities).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <span>
                Arrives: <strong className="text-brand">{eta}</strong> ({etb(fee)})
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-line/60 pt-2 text-mute">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>14-day Buyer Protection &amp; Returns</span>
              </div>
              <div>
                {p.stock <= 0 ? (
                  <b className="font-bold text-red-500">Out of stock</b>
                ) : p.stock <= 3 ? (
                  <b className="font-bold text-amber-600">⚡ Only {p.stock} left</b>
                ) : (
                  <b className="font-bold text-emerald-600">In stock ({p.stock} available)</b>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-line bg-card p-2 shadow-soft md:sticky md:top-24">
            <div className="flex items-center rounded-xl border border-line bg-card">
              <button
                type="button"
                className="px-3 py-2 font-bold text-ink transition hover:text-brand disabled:opacity-40"
                disabled={p.stock <= 0 || qty <= 1}
                onClick={() => setQty(Math.max(1, qty - 1))}
                aria-label="Decrease quantity"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-sm font-bold">{qty}</span>
              <button
                type="button"
                className="px-3 py-2 font-bold text-ink transition hover:text-brand disabled:opacity-40"
                disabled={p.stock <= 0 || qty >= p.stock}
                onClick={() => setQty(Math.min(p.stock, qty + 1))}
                aria-label="Increase quantity"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            <button
              type="button"
              disabled={p.stock <= 0}
              className="btn btn-outline flex-1 font-bold shadow-soft"
              onClick={addNow}
            >
              <ShoppingCart className="mr-1.5 inline h-4 w-4" />
              Add to cart
            </button>

            <button
              type="button"
              disabled={p.stock <= 0}
              className="btn btn-primary flex-1 font-bold shadow-soft"
              onClick={() => {
                if (add(p, qty)) router.push('/checkout');
                else toast(`Only ${p.stock} in stock`);
              }}
            >
              Buy now <ArrowRight className="ml-1.5 inline h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div>
            <h2 className="text-xl font-black text-ink">Customer Reviews &amp; Ratings</h2>
            <p className="text-xs text-mute">Real experiences from shoppers across Ethiopia</p>
          </div>
          <button type="button" onClick={() => setShowReviewForm(!showReviewForm)} className="btn btn-outline btn-sm font-bold">
            <MessageSquarePlus className="mr-1 h-4 w-4 text-brand" />
            {showReviewForm ? 'Close form' : 'Write a Review'}
          </button>
        </div>

        {showReviewForm && (
          <form onSubmit={submitReview} className="card mt-4 border border-brand/30 bg-card p-5 shadow-soft animate-scaleIn">
            <h3 className="font-extrabold text-sm text-ink">Share Your Product Experience</h3>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs font-semibold text-mute">Your rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewRating(star)}
                    className="p-1 transition hover:scale-110"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star className={`h-5 w-5 ${star <= newRating ? 'fill-amber-500 text-amber-500' : 'fill-transparent text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="reviewer-name">Your Name</label>
                <input id="reviewer-name" className="input" value={newAuthor} onChange={(e) => setNewAuthor(e.target.value)} placeholder="Your name" />
              </div>
              <div>
                <label className="label" htmlFor="reviewer-comment">Review</label>
                <textarea id="reviewer-comment" className="input min-h-[96px]" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Tell others what you liked or disliked" />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button type="submit" className="btn btn-primary">Post review</button>
            </div>
          </form>
        )}

        <div className="mt-5 space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="card border border-line bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-ink">{review.name}</span>
                    {review.verified && <span className="pill pill-green text-[10px] font-bold">Verified buyer</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-mute">
                    <Stars r={review.rating} />
                    <span>{review.date}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleHelpful(review.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-line px-2.5 py-1 text-[11px] font-bold text-mute transition hover:border-brand hover:text-brand"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Helpful ({review.helpful})
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-ink/80">{review.comment}</p>
            </article>
          ))}
        </div>
      </section>

      {rel.length > 0 && (
        <section className="mt-12">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-ink">You may also like</h2>
              <p className="text-xs text-mute">Featured picks from this category</p>
            </div>
            <Link href={`/?category=${encodeURIComponent(p.category)}#shop`} className="text-sm font-bold text-brand">
              Browse all
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {rel.map((item) => (
              <Link key={item.id} href={`/products/${item.id}`} className="card p-3 transition hover:-translate-y-0.5 hover:shadow-soft">
                <div className="overflow-hidden rounded-2xl border border-line bg-bg/50">
                  <ProductArtwork product={item} className="h-44" iconClassName="h-16 w-16 text-brand/60" />
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-bold text-ink">{item.name}</h3>
                    <span className="text-xs font-bold text-brand">{etb(item.price)}</span>
                  </div>
                  <p className="mt-1 text-xs text-mute">{item.seller}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}