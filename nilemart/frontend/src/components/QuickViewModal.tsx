'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart, useCompare, useQuickView, useToast, useWishlist } from '@/lib/store';
import { discount, etb } from '@/lib/format';
import { Check, ExternalLink, Heart, Minus, Plus, Scale, ShieldCheck, ShoppingCart, Star, X } from 'lucide-react';
import ProductArtwork from './ProductArtwork';

export default function QuickViewModal() {
  const { product, close } = useQuickView();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const add = useCart((s) => s.add);
  const toast = useToast((s) => s.show);
  const { toggle: toggleWishlist, has: inWishlist } = useWishlist();
  const { toggle: toggleCompare, has: inCompare } = useCompare();

  if (!product) return null;

  const d = discount(product);
  const isWish = inWishlist(product.id);
  const isComp = inCompare(product.id);

  const handleAdd = () => {
    if (product.stock <= 0) return;
    const ok = add(product, qty);
    if (ok) {
      setAdded(true);
      toast(`${qty} × ${product.name} added to cart`);
      setTimeout(() => setAdded(false), 1500);
    } else {
      toast(`Only ${product.stock} in stock`);
    }
  };

  const handleWishlist = () => {
    const isNowAdded = toggleWishlist(product);
    toast(isNowAdded ? 'Saved to Wishlist' : 'Removed from Wishlist');
  };

  const handleCompare = () => {
    const res = toggleCompare(product);
    if (res.maxReached) {
      toast('You can compare up to 3 products at a time');
    } else {
      toast(res.added ? 'Added to compare list' : 'Removed from compare list');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={close}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="card relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl p-5 shadow-2xl sm:p-7 animate-scaleIn bg-card border-line"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-bg text-mute hover:text-ink hover:bg-line transition"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Visual Showcase */}
          <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand/10 via-card to-blue-500/10 border border-line">
            {d > 0 && (
              <span className="absolute left-3 top-3 z-10 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-black text-white shadow-md">
                -{d}% OFF
              </span>
            )}
            <ProductArtwork
              product={product}
              className="absolute inset-0"
              iconClassName="h-32 w-32 text-brand/50 transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between gap-2">
              <span className="pill uppercase tracking-wider text-[10px] font-bold">
                {product.category}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleWishlist}
                  className={`grid h-8 w-8 place-items-center rounded-full border transition ${
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
                  className={`grid h-8 w-8 place-items-center rounded-full border transition ${
                    isComp
                      ? 'border-brand bg-brand/10 text-brand'
                      : 'border-line text-mute hover:border-brand hover:text-brand'
                  }`}
                  title={isComp ? 'Remove from compare' : 'Add to compare'}
                >
                  <Scale className="h-4 w-4" />
                </button>
              </div>
            </div>

            <h2 className="mt-2 text-xl font-extrabold text-ink leading-snug">
              {product.name}
            </h2>
            {product.nameAm && (
              <p className="text-sm font-medium text-mute">{product.nameAm}</p>
            )}

            {/* Ratings & Seller */}
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 font-bold text-amber-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                {product.rating.toFixed(1)}
              </span>
              <span className="text-mute">({product.ratingCount} reviews)</span>
              <span className="text-mute">·</span>
              <span className="text-mute">Sold by <strong className="text-ink">{product.seller}</strong></span>
            </div>

            {/* Pricing */}
            <div className="mt-3 flex items-baseline gap-2.5">
              <span className="text-2xl font-black text-brand">{etb(product.price)}</span>
              {product.oldPrice > product.price && (
                <span className="text-sm text-mute line-through">{etb(product.oldPrice)}</span>
              )}
            </div>

            {/* Description */}
            <p className="mt-2.5 line-clamp-3 text-xs leading-relaxed text-mute">
              {product.description || `High-quality ${product.category.toLowerCase()} delivered across Ethiopia.`}
            </p>

            {/* Stock status */}
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              {product.stock <= 0 ? (
                <span className="text-red-500 font-bold">Currently Out of stock</span>
              ) : product.stock <= 3 ? (
                <span className="text-amber-600 font-bold">Only {product.stock} left in stock!</span>
              ) : (
                <span className="text-emerald-600 font-bold">In stock ({product.stock} available)</span>
              )}
            </div>

            {/* Action Bar */}
            <div className="mt-auto pt-4 space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-xl border border-line bg-bg px-2 py-1">
                  <button
                    disabled={product.stock <= 0 || qty <= 1}
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="p-1 text-ink hover:text-brand disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{qty}</span>
                  <button
                    disabled={product.stock <= 0 || qty >= product.stock}
                    onClick={() => setQty(Math.min(product.stock, qty + 1))}
                    className="p-1 text-ink hover:text-brand disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  disabled={product.stock <= 0}
                  onClick={handleAdd}
                  className="btn btn-primary flex-1 !py-2.5 text-xs sm:text-sm font-bold shadow-soft"
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4" /> Added!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" /> Add to cart
                    </>
                  )}
                </button>
              </div>

              <Link
                href={`/products/${product.id}`}
                onClick={close}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-line py-2 text-xs font-semibold text-mute hover:border-brand hover:text-brand transition"
              >
                <span>View full details &amp; reviews</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
