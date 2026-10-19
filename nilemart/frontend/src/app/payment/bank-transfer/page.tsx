'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api, useConfig } from '@/lib/api';
import { etb } from '@/lib/format';
import { useCart } from '@/lib/store';

function BankTransferContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cfg = useConfig();
  const { clear } = useCart();

  const txRef = searchParams.get('tx_ref');
  const amount = searchParams.get('amount');
  const orderId = searchParams.get('order_id');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api<any>(`/payments/verify/${txRef}`);
      if (res.success) {
        clear();
        router.push(`/payment/success?tx_ref=${txRef}&order_id=${orderId || ''}`);
      } else {
        setError('Payment verification pending or failed. Please ensure you completed the transfer.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify transfer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-8">
      <div className="card max-w-xl w-full p-8 shadow-soft">
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-3xl">
            🏦
          </div>
          <h1 className="text-2xl font-black text-ink">Bank Transfer Payment</h1>
          <p className="text-xs text-mute mt-1">Complete your transfer using the bank details below</p>
        </div>

        {amount && (
          <div className="mb-6 rounded-xl bg-brand/5 p-4 text-center border border-brand/20">
            <div className="text-xs text-mute">Amount to Transfer</div>
            <div className="text-2xl font-black text-brand mt-1">{etb(Number(amount))}</div>
          </div>
        )}

        <div className="space-y-4 mb-6 text-sm">
          <div className="rounded-xl bg-bg p-4 space-y-2 border border-line">
            <div className="font-bold text-ink mb-1">Commercial Bank of Ethiopia (CBE)</div>
            <div className="flex justify-between">
              <span className="text-mute">Account Name:</span>
              <span className="font-bold text-ink">NileMart Trading PLC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-mute">Account Number:</span>
              <span className="font-mono font-bold text-brand">1000123456789</span>
            </div>
          </div>

          <div className="rounded-xl bg-bg p-4 space-y-2 border border-line">
            <div className="font-bold text-ink mb-1">Telebirr / Awash Bank</div>
            <div className="flex justify-between">
              <span className="text-mute">Merchant Number:</span>
              <span className="font-mono font-bold text-brand">+251 911 000 000</span>
            </div>
          </div>
        </div>

        {txRef && (
          <div className="text-xs text-mute mb-6 text-center font-mono">
            Reference ID: {txRef}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-600 font-medium text-center">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="btn btn-primary w-full font-bold"
          >
            {loading ? 'Verifying Transfer...' : 'I Have Made the Transfer'}
          </button>
          <Link href="/checkout" className="btn btn-outline w-full text-center">
            Cancel / Change Payment Method
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BankTransferPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-mute">Loading bank transfer...</div>}>
      <BankTransferContent />
    </Suspense>
  );
}
