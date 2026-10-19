import type { Metadata } from 'next';
import AuthForm from '@/components/AuthForm';

export const metadata: Metadata = {
  title: 'Sign In | NileMart Ethiopia',
  description: 'Sign in to your NileMart account to track orders and shop Ethiopian products.',
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
