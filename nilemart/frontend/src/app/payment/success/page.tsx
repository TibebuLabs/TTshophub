'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useCart } from '@/lib/store';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clear } = useCart();
  
  const txRef = searchParams.get('tx_ref');
  const orderId = searchParams.get('order_id');
  
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!txRef) {
      setError('Missing transaction reference');
      setVerifying(false);
      return;
    }

    // Verify payment with backend
    const verifyPayment = async () => {
      try {
        const result = await api<any>(`/payments/verify/${txRef}`);
        
        if (result.success && result.data.status === 'success') {
          setVerified(true);
          clear(); // Clear cart after successful payment
        } else {
          setError('Payment verification failed');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to verify payment');
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [txRef, clear]);

  if (verifying) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="text-6xl mb-4 animate-bounce">⏳</div>
        <h1 className="text-2xl font-extrabold mb-2">Verifying Payment...</h1>
        <p className="text-mute">Please wait while we confirm your payment</p>
      </div>
    );
  }

  if (error || !verified) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-extrabold mb-2">Payment Verification Failed</h1>
        <p className="text-mute mb-6">{error || 'Could not verify your payment'}</p>
        <div className="flex gap-3">
          <Link href="/orders" className="btn btn-outline">
            View Orders
          </Link>
          <Link href="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="card max-w-lg p-8 text-center">
        {/* Success Animation */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/20 text-5xl animate-up">
          ✅
        </div>

        <h1 className="text-3xl font-extrabold text-success mb-3">
          Payment Successful!
        </h1>
        
        <p className="text-lg text-mute mb-6">
          Thank you for your order. We&apos;ve received your payment and will start processing your order shortly.
        </p>

        {/* Order Reference */}
        {orderId && (
          <div className="rounded-xl bg-bg p-4 mb-6">
            <div className="text-sm text-mute mb-1">Order Reference</div>
            <div className="font-mono font-bold text-brand">{txRef}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/orders" className="btn btn-primary">
            📦 View My Orders
          </Link>
          <Link href="/" className="btn btn-outline">
            🛍️ Continue Shopping
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-6 pt-6 border-t border-line text-sm text-mute">
          <p>A confirmation email has been sent to your registered email address.</p>
          <p className="mt-2">You can track your order status in the Orders page.</p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-mute">Loading payment status...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
