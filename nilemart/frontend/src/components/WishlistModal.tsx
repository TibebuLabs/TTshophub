'use client';
import Link from 'next/link';
import { useCart, useHydrated, useToast, useWishlist } from '@/lib/store';
import { etb } from '@/lib/format';
import { Heart, ShoppingCart, Trash2, X } from 'lucide-react';
import ProductArtwork from './ProductArtwork';

export default function WishlistModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const hydrated = useHydrated();
  const { items, remove, clear } = useWishlist();
  const add = useCart((s) => s.add);
  const toast = useToast((s) => s.show);

  if (!hydrated || !open) return null;

  const handleMoveAll = () => {
    let count = 0;
    for (const item of items) {
      if (item.stock > 0) {
        if (add(item)) count++;
      }
    }
    if (count > 0) {
      toast(`Moved ${count} item(s) to your cart`);
      clear();
      onClose();
    } else {
      toast('None of the saved items are currently in stock');
    }
  };

  const handleAddOne = (item: (typeof items)[0]) => {
    if (item.stock <= 0) {
      toast('Item is out of stock');
      return;
    }
    const ok = add(item);
    if (ok) {
      toast(`Added ${item.name} to cart`);
      remove(item.id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="card relative flex h-full w-full max-w-md flex-col rounded-none bg-card p-5 shadow-2xl border-l border-line animate-slideLeft sm:rounded-l-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            <h2 className="text-lg font-black text-ink">
              My Wishlist <span className="text-sm font-normal text-mute">({items.length})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-bg text-mute hover:text-ink transition"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-red-500/10 text-red-500">
              <Heart className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-base font-bold text-ink">Your wishlist is empty</h3>
            <p className="mt-1 text-xs text-mute max-w-xs">
              Explore our marketplace and click the heart icon on items you love to save them for later!
            </p>
            <button
              onClick={onClose}
              className="btn btn-primary mt-5 !py-2 text-xs font-bold"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto py-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-line bg-bg/40 p-3 hover:border-brand/40 transition"
                >
                  <div className="relative h-14 w-14 flex-none overflow-hidden rounded-xl bg-card border border-line">
                    <ProductArtwork
                      product={item}
                      className="absolute inset-0"
                      iconClassName="h-8 w-8 text-brand/50"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.id}`}
                      onClick={onClose}
                      className="block truncate text-xs font-bold text-ink hover:text-brand"
                    >
                      {item.name}
                    </Link>
                    <div className="mt-0.5 flex items-baseline gap-2">
                      <span className="text-sm font-black text-brand">{etb(item.price)}</span>
                      {item.oldPrice > item.price && (
                        <span className="text-[10px] text-mute line-through">{etb(item.oldPrice)}</span>
                      )}
                    </div>
                    <div className="mt-1 text-[11px]">
                      {item.stock > 0 ? (
                        <span className="font-semibold text-emerald-600">In stock</span>
                      ) : (
                        <span className="font-semibold text-red-500">Out of stock</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <button
                      disabled={item.stock <= 0}
                      onClick={() => handleAddOne(item)}
                      className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-white shadow-soft hover:bg-brand-600 disabled:opacity-40 transition"
                      title="Move to cart"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="grid h-8 w-8 place-items-center rounded-xl border border-line bg-card text-mute hover:text-red-500 transition"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer actions */}
            <div className="border-t border-line pt-4 space-y-2">
              <button
                onClick={handleMoveAll}
                className="btn btn-primary w-full !py-2.5 text-xs sm:text-sm font-bold shadow-soft"
              >
                <ShoppingCart className="h-4 w-4 mr-1.5" /> Move all in-stock to cart
              </button>
              <button
                onClick={clear}
                className="btn btn-outline w-full !py-2 text-xs font-semibold text-mute hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear wishlist
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
