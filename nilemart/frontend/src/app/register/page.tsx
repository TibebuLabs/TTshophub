import type { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Create Customer Account | ShopHub Ethiopia',
  description: 'Create an account to shop authentic Ethiopian coffee, fashion, tech, and gifts.',
};

export default function CustomerRegisterPage() {
  return <AuthForm mode="register" accountRole="customer" />;
}
