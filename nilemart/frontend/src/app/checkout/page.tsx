'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Guard from '@/components/Guard';
import PaymentModal from '@/components/PaymentModal';
import { api } from '@/lib/api';
import { useAuth, useCart, cartSubtotal } from '@/lib/store';
import { useConfig } from '@/lib/api';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { lines, clear } = useCart();
  const config = useConfig();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Addis Ababa');

  const subtotal = cartSubtotal(lines);
  const cityInfo = config.cities[city];
  const shipping = subtotal >= config.freeShippingOver ? 0 : cityInfo?.fee || 0;
  const vat = Math.round(subtotal * 0.15);
  const total = subtotal + shipping + vat;

  const handleCheckout = () => {
    // Validate form
    if (!customerName.trim() || !phone.trim() || !address.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (lines.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setError('');
    setShowPaymentModal(true);
  };

  const handlePaymentMethodSelect = async (method: string, phoneNumber?: string, bank?: string) => {
    try {
      setLoading(true);
      setError('');

      // Create order first with properly formatted items
      const orderData = {
        customerName: customerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city,
        payment: method === 'card' ? 'chapa' : method === 'bank_transfer' ? 'bank' : method,
        items: lines.map(l => ({
          productId: l.product.id, // This is already a UUID from the product
          qty: l.qty,
        })),
      };

      const order = await api<any>('/orders', {
        method: 'POST',
        json: orderData,
      });

      // If COD or Bank Transfer, handle differently
      if (method === 'cod') {
        clear();
        router.push(`/orders?success=true`);
        return;
      }

      if (method === 'bank_transfer' && bank) {
        // Store bank transfer request and show instructions
        clear();
        router.push(`/payment/bank-transfer?order_id=${order.id}&bank=${encodeURIComponent(bank)}`);
        return;
      }

      // Initialize Chapa payment for card/wallet payments
      const [firstName, ...lastNameParts] = customerName.trim().split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      const paymentData = {
        amount: total,
        email: user?.email || 'customer@nilemart.et',
        firstName,
        lastName,
        phoneNumber: phoneNumber || phone,
        orderId: order.id,
        orderCode: order.code,
      };

      const paymentResult = await api<any>('/payments/initialize', {
        method: 'POST',
        json: paymentData,
      });

      if (paymentResult.success && paymentResult.data.checkoutUrl) {
        // Redirect to Chapa checkout
        window.location.href = paymentResult.data.checkoutUrl;
      } else {
        setError(paymentResult.error || 'Failed to initialize payment');
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process checkout');
      setLoading(false);
    }
  };

  if (lines.length === 0) {
    return (
      <Guard role="customer">
        <div className="py-16 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-extrabold mb-2">Your cart is empty</h1>
          <p className="text-mute mb-6">Add some products to get started!</p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </Guard>
    );
  }

  return (
    <Guard role="customer">
      <div className="py-6">
        <h1 className="text-3xl font-extrabold mb-6">Checkout</h1>

        <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="card p-6">
              <h2 className="text-xl font-extrabold mb-4">Customer Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="label" htmlFor="name">Full Name *</label>
                  <input
                    id="name"
                    className="input"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="label" htmlFor="phone">Phone Number *</label>
                  <input
                    id="phone"
                    type="tel"
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09xxxxxxxx"
                    required
                  />
                </div>

                <div>
                  <label className="label" htmlFor="address">Delivery Address *</label>
                  <textarea
                    id="address"
                    className="input"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House number, street name, area..."
                    required
                  />
                </div>

                <div>
                  <label className="label" htmlFor="city">City *</label>
                  <select
                    id="city"
                    className="input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    {Object.keys(config.cities).map((c) => (
                      <option key={c} value={c}>
                        {c} - {config.cities[c].eta}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="card p-6">
              <h2 className="text-xl font-extrabold mb-4">Order Items ({lines.length})</h2>
              
              <div className="space-y-3">
                {lines.map((line) => (
                  <div key={line.product.id} className="flex items-center gap-4 pb-3 border-b border-line last:border-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-mesh text-2xl">
                      {line.product.emoji || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold line-clamp-1">{line.product.name}</div>
                      <div className="text-sm text-mute">
                        {line.product.price.toLocaleString()} ETB × {line.qty}
                      </div>
                    </div>
                    <div className="font-bold">
                      {(line.product.price * line.qty).toLocaleString()} ETB
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="card p-6 sticky top-20">
              <h2 className="text-xl font-extrabold mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-line">
                <div className="flex justify-between text-sm">
                  <span className="text-mute">Subtotal</span>
                  <span className="font-semibold">{subtotal.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-mute">Delivery</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-success">Free</span>
                    ) : (
                      `${shipping.toLocaleString()} ETB`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-mute">VAT (15%)</span>
                  <span className="font-semibold">{vat.toLocaleString()} ETB</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-extrabold">Total</span>
                <span className="text-2xl font-extrabold text-brand">
                  {total.toLocaleString()} ETB
                </span>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
                  {error}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="btn btn-primary w-full btn-lg"
              >
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-mute">
                <span>🔒</span>
                <span>Secure checkout powered by Chapa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        amount={total}
        onClose={() => !loading && setShowPaymentModal(false)}
        onPaymentMethodSelect={handlePaymentMethodSelect}
      />
    </Guard>
  );
}
