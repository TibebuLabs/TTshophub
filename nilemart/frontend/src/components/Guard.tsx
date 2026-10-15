'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth, useHydrated, useToast } from '@/lib/store';

/** Client-side route guard providing strict URL separation between customer and admin portals. */
export default function Guard({
  role,
  children,
}: {
  role?: 'admin' | 'customer';
  children: React.ReactNode;
}) {
  const h = useHydrated();
  const user = useAuth((s) => s.user);
  const r = useRouter();
  const toast = useToast((s) => s.show);
  const bad = !user || (role && user.role !== role);

  useEffect(() => {
    if (!h) return;
    if (!user) {
      // Unauthenticated user attempting to access protected route
      if (role === 'admin') {
        r.replace('/admin/login?next=' + encodeURIComponent(location.pathname));
      } else {
        r.replace('/login?next=' + encodeURIComponent(location.pathname));
      }
    } else if (role && user.role !== role) {
      // Role mismatch
      if (role === 'admin') {
        toast('Admin privileges required. Please sign in to the Admin Portal.');
        r.replace('/admin/login?next=' + encodeURIComponent(location.pathname));
      } else {
        // Admin visiting customer-only route (like checkout)
        r.replace('/admin');
      }
    }
  }, [h, user, role, r, toast]);

  if (!h || bad) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-12 text-center text-mute font-semibold">
        Verifying permissions…
      </div>
    );
  }

  return <>{children}</>;
}
