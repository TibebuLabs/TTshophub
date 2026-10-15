import type { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Customer Sign In | ShopHub Ethiopia',
  description: 'Sign in to your ShopHub customer account to track orders and save your favorites.',
};

export default function CustomerLoginPage() {
  return <AuthForm mode="login" accountRole="customer" />;
}
