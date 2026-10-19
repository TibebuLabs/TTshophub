'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const txRef = searchParams.get('tx_ref');
  const reason = searchParams.get('reason');

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="card max-w-lg p-8 text-center">
        {/* Error Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-error/20 text-5xl animate-up">
          ❌
        </div>

        <h1 className="text-3xl font-extrabold text-error mb-3">
          Payment Failed
        </h1>
        
        <p className="text-lg text-mute mb-6">
          {reason || 'Your payment could not be processed. Please try again or use a different payment method.'}
        </p>

        {/* Transaction Reference */}
        {txRef && (
          <div className="rounded-xl bg-bg p-4 mb-6">
            <div className="text-sm text-mute mb-1">Transaction Reference</div>
            <div className="font-mono font-bold">{txRef}</div>
          </div>
        )}

        {/* Common Reasons */}
        <div className="mb-6 rounded-xl bg-warning/10 p-4 text-left text-sm">
          <div className="font-bold text-warning-600 mb-2">Common reasons for failure:</div>
          <ul className="space-y-1 text-mute">
            <li>• Insufficient balance in your wallet</li>
            <li>• Incorrect PIN entered</li>
            <li>• Payment timeout or cancelled</li>
            <li>• Network connectivity issues</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/checkout" className="btn btn-primary">
            🔄 Try Again
          </Link>
          <Link href="/cart" className="btn btn-outline">
            🛒 Back to Cart
          </Link>
        </div>

        {/* Help Section */}
        <div className="mt-6 pt-6 border-t border-line text-sm text-mute">
          <p>Need help? Contact our support team</p>
          <p className="mt-2 font-semibold">📞 +251 911 000 000</p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[60vh] items-center justify-center text-mute">Loading...</div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}
