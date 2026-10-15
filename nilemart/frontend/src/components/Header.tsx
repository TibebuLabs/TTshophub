'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth, useCart, useHydrated, useTheme, useToast, useWishlist } from '@/lib/store';
import { Bell } from './Notifications';
import WishlistModal from './WishlistModal';
import {
  ArrowDown,
  Heart,
  LogOut,
  Moon,
  Search,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Sun,
  UserRound,
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const h = useHydrated();
  const { user, logout } = useAuth();
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  const wishCount = useWishlist((s) => s.items.length);
  const { theme, setTheme } = useTheme();

  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const f = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener('mousedown', f);
    return () => document.removeEventListener('mousedown', f);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/?q=${encodeURIComponent(q.trim())}#shop` : '/');
  };

  const out = () => {
    logout();
    setOpen(false);
    router.push('/');
    useToast.getState().show('Signed out');
  };

  const item = 'block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold hover:bg-bg transition';

  return (
    <>
      <header className="sticky top-0 z-40 bg-navy text-white shadow-lg transition-colors">
        <div className="container-x flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-1.5 text-2xl font-extrabold tracking-tight">
            <span>Shop</span>
            <span className="text-brand">Hub</span>
            <span className="rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-bold text-brand uppercase tracking-wider">
              Smart
            </span>
          </Link>

          {/* Search bar */}
          <form onSubmit={go} className="order-3 flex min-w-0 flex-[1_1_100%] md:order-none md:flex-1" role="search">
            <div className="relative flex w-full">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search Ethiopian coffee, fashion, electronics, 'gifts'…"
                className="min-w-0 flex-1 rounded-l-xl bg-white px-4 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                aria-label="Search products"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-r-xl bg-brand px-4 sm:px-5 font-bold hover:bg-brand-600 transition"
                aria-label="Search"
              >
                <Search aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline text-xs">Search</span>
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1.5 md:ml-0">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-xl p-2 text-white/80 hover:bg-white/10 hover:text-white transition"
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {/* Wishlist button */}
            <button
              onClick={() => setWishlistOpen(true)}
              className="relative grid h-9 w-9 place-items-center rounded-xl p-2 text-white/80 hover:bg-white/10 hover:text-white transition"
              aria-label="Wishlist"
              title="Saved items"
            >
              <Heart className={`h-4 w-4 ${wishCount > 0 ? 'text-red-400 fill-red-400' : ''}`} />
              {h && wishCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                  {wishCount}
                </span>
              )}
            </button>

            {/* Notifications */}
            {h && user && <Bell />}

            {/* Cart */}
            <Link
              href="/cart"
              className="relative grid h-9 w-9 place-items-center rounded-xl p-2 text-white/80 hover:bg-white/10 hover:text-white transition"
              aria-label="Cart"
              title="Shopping Cart"
            >
              <ShoppingCart aria-hidden="true" className="h-4 w-4" />
              {h && count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-black text-white">
                  {count}
                </span>
              )}
            </Link>

            {/* User Profile */}
            <div ref={ref} className="relative">
              {h && user ? (
                <>
                  <button
                    onClick={() => setOpen(!open)}
                    className="flex items-center gap-2 rounded-full p-1 pr-2.5 hover:bg-white/10 transition"
                    aria-haspopup="menu"
                    aria-expanded={open}
                  >
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-xs font-black shadow-soft">
                      {user.name.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase()}
                    </span>
                    <span className="hidden items-center gap-1 text-xs font-bold sm:flex">
                      {user.name.split(' ')[0]} <ArrowDown aria-hidden="true" className="h-3 w-3" />
                    </span>
                  </button>
                  {open && (
                    <div
                      className="card absolute right-0 top-full z-50 mt-2 w-64 animate-up p-1.5 text-ink shadow-2xl bg-card border-line"
                      role="menu"
                      onClick={() => setOpen(false)}
                    >
                      <div className="border-b border-line px-3 pb-2 pt-1.5">
                        <div className="font-extrabold text-sm">{user.name}</div>
                        <div className="break-all text-xs text-mute">{user.email}</div>
                        <span className={`pill mt-1 ${user.role === 'admin' ? 'pill-green' : ''}`}>
                          {user.role === 'admin' ? 'Admin' : 'Customer'}
                        </span>
                      </div>
                      {user.role === 'admin' ? (
                        <>
                          <Link className={item} href="/admin">
                            <span className="inline-flex items-center gap-2">
                              <ShoppingBag aria-hidden="true" className="h-4 w-4 text-brand" />
                              Admin Dashboard
                            </span>
                          </Link>
                          <Link className={item} href="/admin/orders">
                            <span className="inline-flex items-center gap-2">
                              <span className="h-4 w-4 text-center font-bold text-brand">📦</span>
                              Manage Orders
                            </span>
                          </Link>
                          <Link className={item} href="/admin/products">
                            <span className="inline-flex items-center gap-2">
                              <span className="h-4 w-4 text-center font-bold text-brand">🏷️</span>
                              Manage Products
                            </span>
                          </Link>
                          <Link className={item} href="/admin/users">
                            <span className="inline-flex items-center gap-2">
                              <span className="h-4 w-4 text-center font-bold text-brand">👥</span>
                              Manage Users
                            </span>
                          </Link>
                        </>
                      ) : (
                        <Link className={item} href="/orders">
                          <span className="inline-flex items-center gap-2">
                            <ShoppingBag aria-hidden="true" className="h-4 w-4 text-brand" />
                            My orders
                          </span>
                        </Link>
                      )}
                      <Link className={item} href="/account">
                        <span className="inline-flex items-center gap-2">
                          <Settings aria-hidden="true" className="h-4 w-4" />
                          Account settings
                        </span>
                      </Link>
                      <button className={item + ' text-red-500 hover:text-red-600'} onClick={out}>
                        <span className="inline-flex items-center gap-2">
                          <LogOut aria-hidden="true" className="h-4 w-4" />
                          Log out
                        </span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold hover:bg-white/20 transition"
                >
                  <UserRound aria-hidden="true" className="h-3.5 w-3.5" />
                  <span>Sign in</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Wishlist Drawer */}
      <WishlistModal open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
    </>
  );
}
