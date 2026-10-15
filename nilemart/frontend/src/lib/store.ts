'use client';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartLine, Notif, Product, User } from './types';

interface AuthState {
  token: string | null;
  user: User | null;
  setSession: (t: string, u: User) => void;
  setUser: (u: User) => void;
  logout: () => void;
}
/** Auth state — persisted to localStorage as 'nm-auth'. */
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => set({ token, user }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'nm-auth' },
  ),
);

interface CartState {
  lines: CartLine[];
  add: (p: Product, q?: number) => boolean;
  setQty: (id: string, q: number) => void;
  remove: (id: string) => void;
  clear: () => void;
}
/** Cart state — persisted to localStorage as 'nm-cart'. */
export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      add: (p, q = 1) => {
        const existingQty = get().lines.find((line) => line.product.id === p.id)?.qty ?? 0;
        if (existingQty + q > p.stock) return false;

        set({
          lines: existingQty
            ? get().lines.map((line) =>
                line.product.id === p.id ? { product: p, qty: existingQty + q } : line,
              )
            : [...get().lines, { product: p, qty: q }],
        });
        return true;
      },
      setQty: (id, q) =>
        set({
          lines: get().lines.map((line) =>
            line.product.id === id ? { ...line, qty: Math.max(1, Math.min(q, line.product.stock)) } : line,
          ),
        }),
      remove: (id) => set({ lines: get().lines.filter((line) => line.product.id !== id) }),
      clear: () => set({ lines: [] }),
    }),
    { name: 'nm-cart' },
  ),
);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((s, l) => s + l.product.price * l.qty, 0);

interface ToastState {
  msg: string | null;
  show: (m: string) => void;
}
let t: ReturnType<typeof setTimeout>;
/** Toast state used to display transient notices. */
export const useToast = create<ToastState>((set) => ({
  msg: null,
  show: (msg) => {
    set({ msg });
    clearTimeout(t);
    t = setTimeout(() => set({ msg: null }), 2600);
  },
}));

interface NotifState {
  items: Notif[];
  set: (i: Notif[]) => void;
  add: (n: Notif) => void;
  readAll: () => void;
}
/** Notification state used for inbox updates and unread badges. */
export const useNotif = create<NotifState>((set) => ({
  items: [],
  set: (items) => set({ items }),
  add: (n) =>
    set((state) => ({
      items: [n, ...state.items].slice(0, 30),
    })),
  readAll: () =>
    set((state) => ({
      items: state.items.map((n) => ({ ...n, read: true })),
    })),
}));

interface WishlistState {
  items: Product[];
  toggle: (p: Product) => boolean;
  has: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
}
export const useWishlist = create<WishlistState>()(persist((set, get) => ({
  items: [],
  toggle: (p) => {
    const exists = get().items.some((i) => i.id === p.id);
    if (exists) {
      set({ items: get().items.filter((i) => i.id !== p.id) });
      return false;
    } else {
      set({ items: [p, ...get().items] });
      return true;
    }
  },
  has: (id) => get().items.some((i) => i.id === id),
  remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  clear: () => set({ items: [] }),
}), { name: 'nm-wishlist' }));

interface CompareState {
  items: Product[];
  toggle: (p: Product) => { added: boolean; maxReached?: boolean };
  has: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
}
export const useCompare = create<CompareState>()(persist((set, get) => ({
  items: [],
  toggle: (p) => {
    const list = get().items;
    const exists = list.some((i) => i.id === p.id);
    if (exists) {
      set({ items: list.filter((i) => i.id !== p.id) });
      return { added: false };
    }
    if (list.length >= 3) {
      return { added: false, maxReached: true };
    }
    set({ items: [...list, p] });
    return { added: true };
  },
  has: (id) => get().items.some((i) => i.id === id),
  remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
  clear: () => set({ items: [] }),
}), { name: 'nm-compare' }));

interface QuickViewState {
  product: Product | null;
  open: (p: Product) => void;
  close: () => void;
}
export const useQuickView = create<QuickViewState>((set) => ({
  product: null,
  open: (product) => set({ product }),
  close: () => set({ product: null }),
}));

interface ThemeState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (t: 'light' | 'dark' | 'system') => void;
}
export const useTheme = create<ThemeState>()(persist((set) => ({
  theme: 'system',
  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
      } else if (theme === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
      } else {
        root.classList.remove('dark', 'light');
      }
    }
  },
}), { name: 'nm-theme' }));

/** Avoids SSR/CSR mismatch for persisted state */
export function useHydrated() { const [h, setH] = useState(false); useEffect(() => setH(true), []); return h; }
