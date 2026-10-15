'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useCart, useCompare, useHydrated, useToast } from '@/lib/store';
import { discount, etb } from '@/lib/format';
import { Check, Minus, Plus, Scale, ShoppingCart, Star, Trash2, X } from 'lucide-react';
import ProductArtwork from './ProductArtwork';

export default function CompareDrawer() {
  const hydrated = useHydrated();
  const { items, remove, clear } = useCompare();
  const [open, setOpen] = useState(false);
  const add = useCart((s) => s.add);
  const toast = useToast((s) => s.show);

  if (!hydrated || items.length === 0) return null;

  const handleAddToCart = (item: (typeof items)[0]) => {
    if (item.stock <= 0) {
      toast('Item is out of stock');
      return;
    }
    const ok = add(item);
    toast(ok ? `Added ${item.name} to cart` : 'Not enough stock');
  };

  return (
    <>
      {/* Floating compare button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 left-4 z-40 flex items-center gap-2 rounded-full bg-navy px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xl hover:bg-navy-700 transition md:bottom-6 md:left-6 border border-brand/30"
        aria-label="View product comparison"
      >
        <Scale className="h-4 w-4 text-brand" />
        <span>Compare Products</span>
        <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-[11px] font-black text-white">
          {items.length}
        </span>
      </button>

      {/* Comparison Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-sm animate-fadeIn"
          onClick={() => setOpen(false)}
        >
          <div
            className="card relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-card shadow-2xl border-line animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-brand" />
                <h3 className="text-lg font-black text-ink">
                  Product Comparison <span className="text-sm font-normal text-mute">({items.length}/3)</span>
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={clear}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-red-500 hover:bg-red-500/10 transition"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear all
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-bg text-mute hover:text-ink transition"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Comparison Grid */}
            <div className="flex-1 overflow-x-auto p-4 sm:p-6">
              <div
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${items.length}, minmax(220px, 1fr))`,
                }}
              >
                {items.map((item) => {
                  const d = discount(item);
                  return (
                    <div
                      key={item.id}
                      className="card flex flex-col justify-between p-4 bg-bg/50 border-line hover:border-brand/40 transition"
                    >
                      <div>
                        {/* Remove button */}
                        <div className="flex justify-end">
                          <button
                            onClick={() => remove(item.id)}
                            className="text-mute hover:text-red-500 transition"
                            title="Remove from comparison"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Image preview */}
                        <div className="relative mx-auto my-2 aspect-square w-32 overflow-hidden rounded-xl bg-card border border-line">
                          <ProductArtwork
                            product={item}
                            className="absolute inset-0"
                            iconClassName="h-16 w-16 text-brand/50"
                          />
                        </div>

                        {/* Details */}
                        <span className="pill text-[10px] font-bold uppercase">{item.category}</span>
                        <Link
                          href={`/products/${item.id}`}
                          onClick={() => setOpen(false)}
                          className="mt-1 block font-bold text-sm text-ink hover:text-brand line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        {item.nameAm && (
                          <p className="text-xs text-mute line-clamp-1">{item.nameAm}</p>
                        )}

                        {/* Price & Discount */}
                        <div className="mt-3 flex items-baseline gap-2">
                          <span className="text-lg font-black text-brand">{etb(item.price)}</span>
                          {item.oldPrice > item.price && (
                            <span className="text-xs text-mute line-through">{etb(item.oldPrice)}</span>
                          )}
                          {d > 0 && (
                            <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-600">
                              -{d}%
                            </span>
                          )}
                        </div>

                        {/* Rating */}
                        <div className="mt-2 flex items-center gap-1 text-xs">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <span className="font-bold text-ink">{item.rating.toFixed(1)}</span>
                          <span className="text-mute">({item.ratingCount} reviews)</span>
                        </div>

                        {/* Specifications comparison */}
                        <div className="mt-4 space-y-2 border-t border-line pt-3 text-xs">
                          <div className="flex justify-between py-1 border-b border-line/60">
                            <span className="text-mute">Seller:</span>
                            <span className="font-semibold text-ink">{item.seller}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-line/60">
                            <span className="text-mute">Availability:</span>
                            <span
                              className={`font-semibold ${
                                item.stock > 0 ? 'text-emerald-600' : 'text-red-500'
                              }`}
                            >
                              {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-line/60">
                            <span className="text-mute">Delivery ETA:</span>
                            <span className="font-semibold text-ink">Same day (Addis)</span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-mute">Warranty:</span>
                            <span className="font-semibold text-ink">14-Day Returns</span>
                          </div>
                        </div>
                      </div>

                      {/* Add to cart */}
                      <div className="mt-5 pt-2">
                        <button
                          disabled={item.stock <= 0}
                          onClick={() => handleAddToCart(item)}
                          className="btn btn-primary w-full !py-2 text-xs font-bold"
                        >
                          <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                          {item.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
