'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, useCart, useHydrated } from '@/lib/store';
import { ChartNoAxesColumn, House, Package, ShoppingBag, ShoppingCart, UserRound } from 'lucide-react';

/** Thumb-friendly navigation on phones */
export default function BottomNav() {
  const p = usePathname(), h = useHydrated(), user = useAuth((s) => s.user), count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  const admin = h && user?.role === 'admin';
  const tabs = [
    { href: '/', icon: House, label: 'Home' },
    { href: '/#shop', icon: ShoppingBag, label: 'Shop' },
    ...(admin ? [{ href: '/admin', icon: ChartNoAxesColumn, label: 'Admin' }] : [{ href: '/cart', icon: ShoppingCart, label: 'Cart', badge: count }]),
    { href: admin ? '/admin/orders' : '/orders', icon: Package, label: 'Orders' },
    { href: h && user ? '/account' : '/login', icon: UserRound, label: h && user ? 'Account' : 'Sign in' },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-card pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Main">
      {tabs.map((t) => (
        <Link key={t.label} href={t.href} className={`relative flex flex-1 flex-col items-center py-2 text-[11px] font-semibold ${p === t.href ? 'text-brand' : 'text-mute'}`}>
          <t.icon aria-hidden="true" className="mb-0.5 h-5 w-5" />{t.label}
          {'badge' in t && !!t.badge && h && <span className="absolute right-[26%] top-1 rounded-full bg-brand px-1.5 text-[10px] font-extrabold text-white">{t.badge}</span>}
        </Link>
      ))}
    </nav>
  );
}
