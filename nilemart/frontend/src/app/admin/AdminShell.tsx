'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Guard from '@/components/Guard';
import { ChartNoAxesColumn, Package, ShoppingBag, Users, Store } from 'lucide-react';

const TABS = [
  { href: '/admin', label: 'Dashboard', icon: ChartNoAxesColumn },
  { href: '/admin/orders', label: 'Orders', icon: Package },
  { href: '/admin/products', label: 'Products', icon: ShoppingBag },
  { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isAuthRoute = path.startsWith('/admin/login') || path.startsWith('/admin/register');

  if (isAuthRoute) {
    return <div className="py-6">{children}</div>;
  }

  return (
    <Guard role="admin">
      <div className="pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/10 text-brand">
              <Store aria-hidden="true" className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-ink">ShopHub Admin Console</h1>
                <span className="pill pill-green text-[10px] font-bold">PORTAL</span>
              </div>
              <p className="text-xs text-mute">Manage products, orders, live inventory, and user privileges.</p>
            </div>
          </div>
          <Link
            href="/"
            className="btn btn-outline btn-sm font-semibold text-xs"
          >
            ← View Customer Storefront
          </Link>
        </div>

        <div className="no-scrollbar -mx-3 my-4 flex gap-2 overflow-x-auto px-3 sm:mx-0 sm:px-0">
          {TABS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-none items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition-all shadow-soft ${
                path === href
                  ? 'border-brand bg-brand text-white'
                  : 'border-line bg-card hover:border-brand/40 text-ink'
              }`}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </div>
        {children}
      </div>
    </Guard>
  );
}
