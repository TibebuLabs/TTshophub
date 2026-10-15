'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart, useCompare, useQuickView, useToast, useWishlist } from '@/lib/store';
import { etb } from '@/lib/format';
import type { Product } from '@/lib/types';
import { BadgeCheck, Eye, Heart, Scale, ShoppingCart, Star } from 'lucide-react';
import ProductArtwork from './ProductArtwork';

export default function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  const toast = useToast((s) => s.show);
  const [loading, setLoading] = useState(false);
  const { toggle: toggleWish, has: inWish } = useWishlist();
  const { toggle: toggleComp, has: inComp } = useCompare();
  const openQuickView = useQuickView((s) => s.open);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const isWish = inWish(product.id);
  const isComp = inComp(product.id);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    const success = add(product);
    toast(success ? `Added ${product.name} to cart` : 'Out of stock');
    window.setTimeout(() => setLoading(false), 400);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowAdded = toggleWish(product);
    toast(isNowAdded ? 'Saved to Wishlist ❤️' : 'Removed from Wishlist');
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = toggleComp(product);
    if (res.maxReached) {
      toast('Maximum 3 items in compare list');
    } else {
      toast(res.added ? 'Added to compare list ⚖️' : 'Removed from compare list');
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product);
  };

  return (
    <article className="card group relative flex min-w-0 flex-col overflow-hidden p-0 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-large bg-card border-line">
      <Link
        href={`/products/${product.id}`}
        className="flex flex-1 flex-col rounded-t-2xl outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
        aria-label={`View ${product.name}`}
      >
        <div className="relative grid aspect-square place-items-center overflow-hidden bg-gradient-to-br from-brand/10 via-card to-blue-500/10">
          {discount > 0 && (
            <span className="absolute left-2 top-2 z-10 rounded-lg bg-red-600 px-2 py-0.5 text-xs font-black text-white shadow-md sm:left-3 sm:top-3">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="absolute inset-0 z-10 grid place-items-center bg-black/50 text-sm font-bold text-white backdrop-blur-[2px]">
              Out of stock
            </span>
          )}

          {/* Quick action overlay buttons */}
          <div className="absolute right-2 top-2 z-20 flex flex-col gap-1.5 sm:right-3 sm:top-3">
            <button
              type="button"
              onClick={handleWishlist}
              className={`grid h-8 w-8 place-items-center rounded-full shadow-md backdrop-blur-md transition ${
                isWish
                  ? 'bg-red-500 text-white'
                  : 'bg-card/90 text-mute hover:text-red-500 hover:bg-card'
              }`}
              title={isWish ? 'Remove from wishlist' : 'Save to wishlist'}
              aria-label={isWish ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart className={`h-4 w-4 ${isWish ? 'fill-current' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleQuickView}
              className="grid h-8 w-8 place-items-center rounded-full bg-card/90 text-mute shadow-md backdrop-blur-md opacity-90 transition hover:bg-card hover:text-brand sm:opacity-0 sm:group-hover:opacity-100"
              title="Quick preview"
              aria-label="Quick preview"
            >
              <Eye className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleCompare}
              className={`grid h-8 w-8 place-items-center rounded-full shadow-md backdrop-blur-md transition ${
                isComp
                  ? 'bg-brand text-white opacity-100'
                  : 'bg-card/90 text-mute hover:text-brand hover:bg-card opacity-90 sm:opacity-0 sm:group-hover:opacity-100'
              }`}
              title={isComp ? 'Remove from comparison' : 'Compare product'}
              aria-label={isComp ? 'Remove from comparison' : 'Compare product'}
            >
              <Scale className="h-4 w-4" />
            </button>
          </div>

          <ProductArtwork
            product={product}
            className="absolute inset-0"
            iconClassName="h-20 w-20 text-brand/50 transition-transform duration-300 group-hover:scale-110 sm:h-28 sm:w-28"
          />

          {product.featured && (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-bold text-ink shadow-soft sm:bottom-3 sm:left-3 border border-line">
              <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5 text-brand" /> Featured
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-3 sm:p-4">
          <span className="mb-1 truncate text-[10px] font-bold uppercase tracking-wider text-mute sm:text-xs">
            {product.category}
          </span>
          <h3 className="line-clamp-2 min-h-10 text-sm font-bold leading-5 text-ink transition-colors group-hover:text-brand sm:text-base">
            {product.name}
          </h3>
          <div
            className="mt-1.5 flex items-center gap-1.5"
            aria-label={`${product.rating.toFixed(1)} out of 5 stars, ${product.ratingCount} ratings`}
          >
            <Star className="h-3.5 w-3.5 fill-warning text-warning" aria-hidden="true" />
            <span className="text-xs font-bold text-ink">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-mute">({product.ratingCount})</span>
          </div>
          <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-3">
            <span className="text-base font-black text-brand sm:text-lg">{etb(product.price)}</span>
            {product.oldPrice > product.price && (
              <span className="text-xs text-mute line-through">{etb(product.oldPrice)}</span>
            )}
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <p className="mt-1 text-[11px] font-semibold text-amber-600 sm:text-xs">
              ⚡ Only {product.stock} left in stock
            </p>
          )}
        </div>
      </Link>

      <div className="px-3 pb-3 sm:px-4 sm:pb-4">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stock === 0 || loading}
          className="btn btn-primary w-full !py-2 text-xs sm:text-sm font-bold shadow-soft"
        >
          {loading ? (
            'Adding…'
          ) : product.stock === 0 ? (
            'Out of stock'
          ) : (
            <>
              <ShoppingCart aria-hidden="true" className="mr-1.5 inline h-4 w-4" />
              Add to cart
            </>
          )}
        </button>
      </div>
    </article>
  );
}
