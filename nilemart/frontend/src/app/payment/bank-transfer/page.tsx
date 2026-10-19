'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';

export default function BankTransferPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const bank = searchParams.get('bank');
  const [copied, setCopied] = useState(false);

  const bankDetails = {
    accountName: 'NileMart Trading PLC',
    accountNumber: '1000123456789',
    bankName: bank || 'Commercial Bank of Ethiopia',
    branch: 'Addis Ababa Main Branch',
    swift: 'CBETETAA',
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center py-8">
      <div className="card max-w-2xl p-8 w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20 text-4xl">
            🏦
          </div>
          <h1 className="text-3xl font-extrabold text-ink mb-2">
            Bank Transfer Instructions
          </h1>
          <p className="text-mute">
            Complete your payment using the details below
          </p>
        </div>

        {/* Bank Details Card */}
        <div className="rounded-2xl border-2 border-brand/20 bg-gradient-to-br from-brand/5 to-amber-50 p-6 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-xs text-mute uppercase tracking-wider mb-1">Bank Name</div>
                <div className="font-bold text-ink">{bankDetails.bankName}</div>
              </div>
            </div>

            <div className="border-t border-line pt-4">
              <div className="text-xs text-mute uppercase tracking-wider mb-1">Account Name</div>
              <div className="font-bold text-ink">{bankDetails.accountName}</div>
            </div>

            <div className="border-t border-line pt-4">
              <div className="text-xs text-mute uppercase tracking-wider mb-1">Account Number</div>
              <div className="flex items-center justify-between">
                <div className="font-mono font-extrabold text-2xl text-brand">
                  {bankDetails.accountNumber}
                </div>
                <button
                  onClick={() => copyToClipboard(bankDetails.accountNumber)}
                  className="btn btn-sm btn-outline"
                >
                  {copied ? '✓ Copied' : '📋 Copy'}
                </button>
              </div>
            </div>

            <div className="border-t border-line pt-4 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-mute uppercase tracking-wider mb-1">Branch</div>
                <div className="font-semibold text-sm">{bankDetails.branch}</div>
              </div>
              <div>
                <div className="text-xs text-mute uppercase tracking-wider mb-1">SWIFT Code</div>
                <div className="font-semibold text-sm">{bankDetails.swift}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-xl bg-blue-500/10 p-6 mb-6">
          <div className="font-bold text-ink mb-3 flex items-center gap-2">
            <span className="text-blue-600">💡</span>
            How to complete the transfer
          </div>
          <ol className="space-y-2 text-sm text-mute">
            <li className="flex gap-3">
              <span className="flex-none font-bold text-brand">1.</span>
              <span>Visit your bank branch or use mobile/internet banking</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-none font-bold text-brand">2.</span>
              <span>Transfer the order amount to the account number above</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-none font-bold text-brand">3.</span>
              <span>Include your <strong>Order ID: {orderId?.slice(0, 8)}</strong> in the transfer reference</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-none font-bold text-brand">4.</span>
              <span>Keep the transaction receipt for verification</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-none font-bold text-brand">5.</span>
              <span>We&apos;ll verify and confirm your order within 24 hours</span>
            </li>
          </ol>
        </div>

        {/* Important Notice */}
        <div className="rounded-xl bg-warning/10 p-4 mb-6">
          <div className="font-bold text-warning-600 mb-2 flex items-center gap-2">
            <span>⚠️</span>
            Important
          </div>
          <ul className="space-y-1 text-sm text-mute">
            <li>• Make sure to include your order ID in the transfer reference</li>
            <li>• Save your transaction receipt until order is confirmed</li>
            <li>• Orders are held for 48 hours pending payment verification</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/orders" className="btn btn-primary flex-1">
            📦 View My Orders
          </Link>
          <Link href="/" className="btn btn-outline flex-1">
            🏠 Back to Home
          </Link>
        </div>

        {/* Contact Support */}
        <div className="mt-6 text-center text-sm text-mute">
          <p>Need help with the transfer?</p>
          <p className="mt-1">
            <strong className="text-ink">Contact us:</strong> +251 911 000 000 or support@nilemart.et
          </p>
        </div>
      </div>
    </div>
  );
}
