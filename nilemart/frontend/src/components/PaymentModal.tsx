'use client';
import { useState } from 'react';
import { Modal } from './ui';

type PaymentCategory = 'wallets' | 'cards' | 'bank_transfer' | 'cod';

interface PaymentOption {
  id: string;
  name: string;
  logo: string;
  category: PaymentCategory;
}

const WALLET_OPTIONS: PaymentOption[] = [
  { id: 'telebirr', name: 'Telebirr', logo: '📱', category: 'wallets' },
  { id: 'cbe', name: 'CBE Birr', logo: '🏦', category: 'wallets' },
  { id: 'mpesa', name: 'M-Pesa', logo: '💳', category: 'wallets' },
  { id: 'ebirr', name: 'e-Birr', logo: '💰', category: 'wallets' },
];

const ETHIOPIAN_BANKS = [
  'Commercial Bank of Ethiopia (CBE)',
  'Awash Bank',
  'Dashen Bank',
  'Bank of Abyssinia',
  'Wegagen Bank',
  'United Bank',
  'Nib International Bank',
  'Cooperative Bank of Oromia',
  'Lion International Bank',
  'Oromia International Bank',
  'Zemen Bank',
  'Bunna International Bank',
  'Berhan International Bank',
  'Abay Bank',
  'Addis International Bank',
  'Debub Global Bank',
  'Enat Bank',
  'Hijra Bank',
  'Shabelle Bank',
  'Tsehay Bank',
];

interface PaymentModalProps {
  open: boolean;
  amount: number;
  onClose: () => void;
  onPaymentMethodSelect: (method: string, phoneNumber?: string, bank?: string) => void;
}

export default function PaymentModal({
  open,
  amount,
  onClose,
  onPaymentMethodSelect,
}: PaymentModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<PaymentCategory | ''>('');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [selectedBank, setSelectedBank] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCategorySelect = (category: PaymentCategory) => {
    setSelectedCategory(category);
    setSelectedWallet('');
    setSelectedBank('');
    setPhoneNumber('');
  };

  const handleProceed = () => {
    if (selectedCategory === 'wallets' && (!selectedWallet || !phoneNumber)) {
      return;
    }
    if (selectedCategory === 'bank_transfer' && !selectedBank) {
      return;
    }
    if (selectedCategory === 'cards') {
      // Card payment via Chapa
      setIsProcessing(true);
      onPaymentMethodSelect('card');
      return;
    }
    if (selectedCategory === 'cod') {
      setIsProcessing(true);
      onPaymentMethodSelect('cod');
      return;
    }

    setIsProcessing(true);
    if (selectedCategory === 'wallets') {
      onPaymentMethodSelect(selectedWallet, phoneNumber);
    } else if (selectedCategory === 'bank_transfer') {
      onPaymentMethodSelect('bank_transfer', undefined, selectedBank);
    }
  };

  const formatAmount = (amount: number) => {
    return `ETB ${amount.toLocaleString()}`;
  };

  const canProceed = 
    (selectedCategory === 'wallets' && selectedWallet && phoneNumber) ||
    (selectedCategory === 'bank_transfer' && selectedBank) ||
    (selectedCategory === 'cards') ||
    (selectedCategory === 'cod');

  return (
    <Modal open={open} onClose={onClose} title="Select Payment Method">
      <div className="space-y-4">
        {/* Amount Display */}
        <div className="rounded-xl bg-gradient-to-r from-brand to-brand-600 p-4 text-white">
          <div className="text-sm opacity-90">Total to pay</div>
          <div className="text-3xl font-extrabold">{formatAmount(amount)}</div>
        </div>

        {/* Payment Categories */}
        <div className="space-y-2">
          <button
            onClick={() => handleCategorySelect('wallets')}
            className={`
              card w-full p-4 text-left transition-all duration-200 flex items-center justify-between
              ${selectedCategory === 'wallets' 
                ? 'border-brand bg-brand/10 ring-2 ring-brand' 
                : 'hover:border-brand/50'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20 text-xl">
                💳
              </div>
              <div>
                <div className="font-bold text-ink">Wallets</div>
                <div className="text-xs text-mute">Telebirr, CBE Birr, M-Pesa, e-Birr</div>
              </div>
            </div>
            <div className="text-brand">→</div>
          </button>

          <button
            onClick={() => handleCategorySelect('cards')}
            className={`
              card w-full p-4 text-left transition-all duration-200 flex items-center justify-between
              ${selectedCategory === 'cards' 
                ? 'border-brand bg-brand/10 ring-2 ring-brand' 
                : 'hover:border-brand/50'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20 text-xl">
                💳
              </div>
              <div>
                <div className="font-bold text-ink">Local Cards</div>
                <div className="text-xs text-mute">Visa, Mastercard via Chapa</div>
              </div>
            </div>
            <div className="text-brand">→</div>
          </button>

          <button
            onClick={() => handleCategorySelect('bank_transfer')}
            className={`
              card w-full p-4 text-left transition-all duration-200 flex items-center justify-between
              ${selectedCategory === 'bank_transfer' 
                ? 'border-brand bg-brand/10 ring-2 ring-brand' 
                : 'hover:border-brand/50'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20 text-xl">
                🏦
              </div>
              <div>
                <div className="font-bold text-ink">Bank Transfers</div>
                <div className="text-xs text-mute">All Ethiopian banks supported</div>
              </div>
            </div>
            <div className="text-brand">→</div>
          </button>

          <button
            onClick={() => handleCategorySelect('cod')}
            className={`
              card w-full p-4 text-left transition-all duration-200 flex items-center justify-between
              ${selectedCategory === 'cod' 
                ? 'border-brand bg-brand/10 ring-2 ring-brand' 
                : 'hover:border-brand/50'
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/20 text-xl">
                💵
              </div>
              <div>
                <div className="font-bold text-ink">Cash on Delivery</div>
                <div className="text-xs text-mute">Pay when you receive</div>
              </div>
            </div>
            <div className="text-brand">→</div>
          </button>
        </div>

        {/* Wallet Selection */}
        {selectedCategory === 'wallets' && (
          <div className="animate-up space-y-3">
            <div className="text-sm font-bold text-ink">Choose your wallet</div>
            <div className="grid grid-cols-2 gap-2">
              {WALLET_OPTIONS.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => setSelectedWallet(wallet.id)}
                  className={`
                    card p-3 text-center transition-all duration-200
                    ${selectedWallet === wallet.id 
                      ? 'border-brand bg-brand/10 ring-2 ring-brand' 
                      : 'hover:border-brand/50'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{wallet.logo}</div>
                  <div className="text-xs font-semibold">{wallet.name}</div>
                </button>
              ))}
            </div>

            {selectedWallet && (
              <div className="animate-up">
                <label className="label" htmlFor="payment-phone">
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    id="payment-phone"
                    type="tel"
                    className="input pl-12"
                    placeholder="09xxxxxxxx"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isProcessing}
                    autoComplete="tel"
                  />
                  <div className="absolute left-3 top-2.5 text-lg">📱</div>
                </div>
                <p className="mt-1 text-xs text-mute">
                  We'll send a payment request. Open your app and approve with your PIN.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bank Transfer Selection */}
        {selectedCategory === 'bank_transfer' && (
          <div className="animate-up space-y-3">
            <div className="text-sm font-bold text-ink">Select your bank</div>
            <select
              className="input"
              value={selectedBank}
              onChange={(e) => setSelectedBank(e.target.value)}
              disabled={isProcessing}
            >
              <option value="">Choose a bank...</option>
              {ETHIOPIAN_BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
            {selectedBank && (
              <div className="rounded-lg bg-blue-500/10 p-3 text-xs text-blue-700">
                <strong>Note:</strong> After clicking Pay, you'll receive our bank account details 
                to complete the transfer. Please keep the transaction reference for verification.
              </div>
            )}
          </div>
        )}

        {/* Cash on Delivery Info */}
        {selectedCategory === 'cod' && (
          <div className="animate-up rounded-lg bg-emerald-500/10 p-4 text-sm text-emerald-700">
            <div className="font-bold mb-2">💵 Cash on Delivery</div>
            <p>Pay in cash when your order arrives at your doorstep. Available for all areas.</p>
          </div>
        )}

        {/* Security Notice */}
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-xs">
          <span className="text-emerald-600">🔒</span>
          <span className="text-emerald-700">
            Encrypted & Secure Payment • Powered by Chapa
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className="btn btn-outline flex-1"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            disabled={!canProceed || isProcessing}
            className="btn btn-primary flex-1"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                Processing...
              </span>
            ) : (
              `Pay ${formatAmount(amount)}`
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
