'use client';
import { useToast } from '@/lib/store';
export default function Toaster() {
  const msg = useToast((s) => s.msg);
  if (!msg) return null;
  return <div role="status" className="fixed bottom-24 left-1/2 z-[70] max-w-[90vw] -translate-x-1/2 animate-up rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-xl md:bottom-6">{msg}</div>;
}
